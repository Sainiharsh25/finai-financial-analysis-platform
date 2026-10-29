package com.finai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finai.entity.HistoricalPrice;
import com.finai.entity.Stock;
import com.finai.repository.HistoricalPriceRepository;
import com.finai.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class MarketDataService {

    private static final int MIN_CACHED_RECORDS = 100;

    @Value("${alphavantage.api.key:}")
    private String apiKey;

    @Value("${alphavantage.base.url:https://www.alphavantage.co/query}")
    private String baseUrl;

    @Value("${alphavantage.symbol.RELIANCE:}")
    private String relianceProviderSymbol;

    private final StockRepository stockRepository;
    private final HistoricalPriceRepository historicalPriceRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static long lastRequestTimeMillis = 0L;

    @Transactional
    public List<HistoricalPrice> fetchAndSaveDailyPrices(String symbol)
            throws Exception {

        String normalizedSymbol = normalizeSymbol(symbol);

        Stock stock = stockRepository.findBySymbol(normalizedSymbol)
                .orElse(null);

        List<HistoricalPrice> cached = stock == null
                ? new ArrayList<>()
                : historicalPriceRepository
                .findByStockOrderByTradingDateAsc(stock);

        // Reuse a sufficiently populated cache.
        if (cached.size() >= MIN_CACHED_RECORDS) {
            return cached;
        }

        List<MarketBar> bars = List.of();
        Exception providerFailure = null;

        // 1. Try TejHQ first.
        try {
            bars = fetchTejHQ(normalizedSymbol);
        } catch (Exception exception) {
            providerFailure = exception;
            System.err.println(
                    "TejHQ failed for " + normalizedSymbol
                            + ": " + exception.getMessage()
            );
        }

        // 2. Fall back to Alpha Vantage.
        if (bars.isEmpty() && apiKey != null && !apiKey.isBlank()) {
            try {
                bars = fetchAlphaVantage(normalizedSymbol);
            } catch (Exception exception) {
                if (providerFailure != null) {
                    exception.addSuppressed(providerFailure);
                }

                providerFailure = exception;

                System.err.println(
                        "Alpha Vantage failed for " + normalizedSymbol
                                + ": " + exception.getMessage()
                );
            }
        }

        // 3. Fall back to Yahoo Finance.
        if (bars.isEmpty()) {
            try {
                bars = fetchYahooFinance(normalizedSymbol);
            } catch (Exception exception) {
                if (providerFailure != null) {
                    exception.addSuppressed(providerFailure);
                }

                providerFailure = exception;

                System.err.println(
                        "Yahoo Finance failed for " + normalizedSymbol
                                + ": " + exception.getMessage()
                );
            }
        }

        // If providers are unavailable, use existing data if possible.
        if (bars.isEmpty()) {
            if (!cached.isEmpty()) {
                System.err.println(
                        "Using " + cached.size()
                                + " cached records for " + normalizedSymbol
                );
                return cached;
            }

            throw new IllegalStateException(
                    "Unable to load historical prices for "
                            + normalizedSymbol
                            + " from TejHQ, Alpha Vantage, or Yahoo Finance.",
                    providerFailure
            );
        }

        bars = bars.stream()
                .sorted(Comparator.comparing(MarketBar::date))
                .toList();

        // Create the stock only after valid market data is received.
        if (stock == null) {
            stock = stockRepository.save(
                    Stock.builder()
                            .symbol(normalizedSymbol)
                            .companyName(normalizedSymbol)
                            .exchange("NSE")
                            .build()
            );
        }

        // Insert only dates that are not already present.
        List<HistoricalPrice> newPrices = new ArrayList<>();

        for (MarketBar bar : bars) {
            if (historicalPriceRepository
                    .existsByStockAndTradingDate(stock, bar.date())) {
                continue;
            }

            newPrices.add(
                    HistoricalPrice.builder()
                            .stock(stock)
                            .tradingDate(bar.date())
                            .openPrice(bar.open())
                            .highPrice(bar.high())
                            .lowPrice(bar.low())
                            .closePrice(bar.close())
                            .volume(bar.volume())
                            .build()
            );
        }

        if (!newPrices.isEmpty()) {
            historicalPriceRepository.saveAll(newPrices);
            historicalPriceRepository.flush();
        }

        return historicalPriceRepository
                .findByStockOrderByTradingDateAsc(stock);
    }

    /**
     * Fetch daily OHLCV data from TejHQ.
     * This mapping currently supports RELIANCE only.
     */
    private List<MarketBar> fetchTejHQ(String symbol) throws Exception {

        if (!"RELIANCE".equals(symbol)) {
            throw new IllegalArgumentException(
                    "TejHQ mapping is configured only for RELIANCE. "
                            + "Symbol received: " + symbol
            );
        }

        LocalDate to = LocalDate.now(ZoneId.of("Asia/Kolkata"));
        LocalDate from = to.minusDays(365);

        String url = UriComponentsBuilder
                .fromUriString(
                        "https://api.tejhq.dev/v1/ohlcv/nse/RELIANCE"
                )
                .queryParam("from", from)
                .queryParam("to", to)
                .build()
                .encode()
                .toUriString();

        String response = restTemplate.getForObject(url, String.class);

        if (response == null || response.isBlank()) {
            throw new IllegalStateException(
                    "TejHQ returned an empty response"
            );
        }

        JsonNode root = objectMapper.readTree(response);

        if (root.has("error")) {
            throw new IllegalStateException(
                    "TejHQ API error: " + root.path("error").asText()
            );
        }

        JsonNode data = root.path("data");

        if (!data.isArray() || data.isEmpty()) {
            throw new IllegalStateException(
                    "TejHQ returned no historical data for " + symbol
            );
        }

        List<MarketBar> bars = new ArrayList<>();

        for (JsonNode row : data) {
            if (row.path("date").isMissingNode()
                    || row.path("date").isNull()
                    || row.path("date").asText().isBlank()) {
                continue;
            }

            bars.add(
                    new MarketBar(
                            LocalDate.parse(row.path("date").asText()),
                            readDecimal(row, "open"),
                            readDecimal(row, "high"),
                            readDecimal(row, "low"),
                            readDecimal(row, "close"),
                            readVolume(row, "volume")
                    )
            );
        }

        if (bars.isEmpty()) {
            throw new IllegalStateException(
                    "TejHQ returned no usable daily prices for " + symbol
            );
        }

        return bars;
    }

    private List<MarketBar> fetchAlphaVantage(String symbol)
            throws Exception {

        String providerSymbol = resolveProviderSymbol(symbol);

        String url = UriComponentsBuilder.fromUriString(baseUrl)
                .queryParam("function", "TIME_SERIES_DAILY")
                .queryParam("symbol", providerSymbol)
                .queryParam("outputsize", "compact")
                .queryParam("apikey", apiKey)
                .build()
                .encode()
                .toUriString();

        String response = getRateLimitedResponse(url);

        if (response == null || response.isBlank()) {
            throw new IllegalStateException(
                    "Alpha Vantage returned an empty response"
            );
        }

        JsonNode root = objectMapper.readTree(response);

        if (root.has("Error Message")
                || root.has("Note")
                || root.has("Information")) {
            throw new IllegalStateException(
                    "Alpha Vantage returned an error or quota message"
            );
        }

        JsonNode series = root.get("Time Series (Daily)");

        if (series == null || !series.fields().hasNext()) {
            throw new IllegalStateException(
                    "Alpha Vantage returned no daily series for "
                            + providerSymbol
            );
        }

        List<MarketBar> bars = new ArrayList<>();
        var fields = series.fields();

        while (fields.hasNext()) {
            var entry = fields.next();
            JsonNode daily = entry.getValue();

            bars.add(
                    new MarketBar(
                            LocalDate.parse(entry.getKey()),
                            readDecimal(daily, "1. open"),
                            readDecimal(daily, "2. high"),
                            readDecimal(daily, "3. low"),
                            readDecimal(daily, "4. close"),
                            readVolume(daily, "5. volume")
                    )
            );
        }

        return bars;
    }

    private List<MarketBar> fetchYahooFinance(String symbol)
            throws Exception {

        String providerSymbol = resolveYahooSymbol(symbol);

        String url = UriComponentsBuilder
                .fromUriString(
                        "https://query1.finance.yahoo.com/v8/finance/chart/"
                                + providerSymbol
                )
                .queryParam("range", "1y")
                .queryParam("interval", "1d")
                .build()
                .encode()
                .toUriString();

        String response = restTemplate.getForObject(url, String.class);

        if (response == null || response.isBlank()) {
            throw new IllegalStateException(
                    "Yahoo Finance returned an empty response"
            );
        }

        JsonNode root = objectMapper.readTree(response);
        JsonNode result = root.path("chart").path("result").path(0);

        if (result.isMissingNode() || result.isNull()) {
            throw new IllegalStateException(
                    "Yahoo Finance returned no chart data for "
                            + providerSymbol
            );
        }

        JsonNode timestamps = result.path("timestamp");
        JsonNode quote = result.path("indicators")
                .path("quote").path(0);

        JsonNode opens = quote.path("open");
        JsonNode highs = quote.path("high");
        JsonNode lows = quote.path("low");
        JsonNode closes = quote.path("close");
        JsonNode volumes = quote.path("volume");

        List<MarketBar> bars = new ArrayList<>();

        for (int i = 0; i < timestamps.size(); i++) {
            if (opens.size() <= i || highs.size() <= i
                    || lows.size() <= i || closes.size() <= i
                    || volumes.size() <= i) {
                continue;
            }

            if (opens.get(i).isNull() || highs.get(i).isNull()
                    || lows.get(i).isNull() || closes.get(i).isNull()
                    || volumes.get(i).isNull()) {
                continue;
            }

            LocalDate date = Instant.ofEpochSecond(
                            timestamps.get(i).asLong())
                    .atZone(ZoneId.of("Asia/Kolkata"))
                    .toLocalDate();

            bars.add(
                    new MarketBar(
                            date,
                            decimalNode(opens.get(i)),
                            decimalNode(highs.get(i)),
                            decimalNode(lows.get(i)),
                            decimalNode(closes.get(i)),
                            volumes.get(i).asLong()
                    )
            );
        }

        if (bars.isEmpty()) {
            throw new IllegalStateException(
                    "Yahoo Finance returned no usable daily prices for "
                            + providerSymbol
            );
        }

        return bars;
    }

    private synchronized String getRateLimitedResponse(String url)
            throws InterruptedException {

        long waitMillis =
                1000L - (System.currentTimeMillis() - lastRequestTimeMillis);

        if (waitMillis > 0) {
            Thread.sleep(waitMillis);
        }

        lastRequestTimeMillis = System.currentTimeMillis();

        return restTemplate.getForObject(url, String.class);
    }

    private String resolveProviderSymbol(String symbol) {
        if ("RELIANCE".equals(symbol)
                && relianceProviderSymbol != null
                && !relianceProviderSymbol.isBlank()) {
            return relianceProviderSymbol.trim().toUpperCase(Locale.ROOT);
        }

        return symbol;
    }

    private String resolveYahooSymbol(String symbol) {
        if ("RELIANCE".equals(symbol)) {
            return "RELIANCE.NS";
        }

        if (symbol.contains(".")) {
            return symbol;
        }

        throw new IllegalArgumentException(
                "Yahoo Finance symbol mapping is not configured for "
                        + symbol
        );
    }

    private String normalizeSymbol(String symbol) {
        if (symbol == null || symbol.isBlank()) {
            throw new IllegalArgumentException(
                    "Stock symbol is required"
            );
        }

        return symbol.trim().toUpperCase(Locale.ROOT);
    }

    private BigDecimal readDecimal(JsonNode node, String fieldName) {
        JsonNode value = node.get(fieldName);

        if (value == null || value.isNull()
                || value.asText().isBlank()
                || !value.isNumber() && !value.isTextual()) {
            throw new IllegalStateException(
                    "Missing or invalid market-data field: " + fieldName
            );
        }

        return new BigDecimal(value.asText());
    }

    private Long readVolume(JsonNode node, String fieldName) {
        JsonNode value = node.get(fieldName);

        if (value == null || value.isNull()
                || !value.canConvertToLong()) {
            throw new IllegalStateException(
                    "Missing or invalid market-data field: " + fieldName
            );
        }

        return value.asLong();
    }

    private BigDecimal decimalNode(JsonNode node) {
        return new BigDecimal(node.asText());
    }

    private record MarketBar(
            LocalDate date,
            BigDecimal open,
            BigDecimal high,
            BigDecimal low,
            BigDecimal close,
            Long volume
    ) {
    }
}
