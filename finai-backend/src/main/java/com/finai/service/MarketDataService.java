
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
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MarketDataService {

    private static final int CACHE_VALIDITY_DAYS = 5;

    @Value("${alphavantage.api.key:}")
    private String apiKey;

    @Value("${alphavantage.base.url:https://www.alphavantage.co/query}")
    private String baseUrl;

    @Value("${alphavantage.symbol.RELIANCE:RELIANCE}")
    private String relianceSymbol;

    @Value("${alphavantage.symbol.TCS:TCS.BSE}")
    private String tcsSymbol;

    @Value("${alphavantage.symbol.INFY:INFY}")
    private String infySymbol;

    @Value("${alphavantage.symbol.HDFCBANK:HDFCBANK}")
    private String hdfcSymbol;

    private final StockRepository stockRepository;
    private final HistoricalPriceRepository historicalPriceRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static long lastRequestTimeMillis = 0L;

    @Transactional
    public List<HistoricalPrice> fetchAndSaveDailyPrices(String symbol)
            throws Exception {

        String normalizedSymbol = normalizeSymbol(symbol);

        System.out.println("MARKET DATA VERSION: ALPHA VANTAGE PRIMARY");
        System.out.println("NORMALIZED SYMBOL: [" + normalizedSymbol + "]");

        Stock stock = stockRepository.findBySymbol(normalizedSymbol)
                .orElse(null);

        List<HistoricalPrice> cached = stock == null
                ? new ArrayList<>()
                : historicalPriceRepository
                .findByStockOrderByTradingDateAsc(stock);

        LocalDate today = LocalDate.now(ZoneId.of("Asia/Kolkata"));

        LocalDate latestCachedDate = cached.isEmpty()
                ? null
                : cached.get(cached.size() - 1).getTradingDate();

        boolean cacheIsRecent = latestCachedDate != null
                && !latestCachedDate.isBefore(
                today.minusDays(CACHE_VALIDITY_DAYS)
        );

        // Return cached data without consuming API calls.
        if (cacheIsRecent) {
            System.out.println(
                    "Returning cached prices for " + normalizedSymbol
                            + ". Latest trading date: " + latestCachedDate
            );
            return cached;
        }

        List<MarketBar> bars = List.of();
        Exception providerFailure = null;

        // Primary provider: Alpha Vantage.
        try {
            bars = fetchAlphaVantage(normalizedSymbol);

        } catch (Exception exception) {
            providerFailure = exception;

            System.err.println(
                    "Alpha Vantage failed for " + normalizedSymbol
                            + ": " + safeErrorMessage(exception)
            );
        }

        // Fallback provider: TejHQ for RELIANCE only.
        if (bars.isEmpty() && "RELIANCE".equals(normalizedSymbol)) {
            try {
                bars = fetchTejHQ(normalizedSymbol);

            } catch (Exception exception) {
                if (providerFailure != null) {
                    exception.addSuppressed(providerFailure);
                }

                providerFailure = exception;

                System.err.println(
                        "TejHQ failed for " + normalizedSymbol
                                + ": " + safeErrorMessage(exception)
                );
            }
        }

        // Return cached records if providers fail.
        if (bars.isEmpty()) {
            if (!cached.isEmpty()) {
                System.out.println(
                        "Returning cached fallback data for "
                                + normalizedSymbol
                );
                return cached;
            }

            throw new IllegalStateException(
                    "Unable to load historical prices for "
                            + normalizedSymbol
                            + ". No cached prices are available.",
                    providerFailure
            );
        }

        bars = bars.stream()
                .sorted(Comparator.comparing(MarketBar::date))
                .toList();

        // Create stock record if it does not exist.
        if (stock == null) {
            stock = stockRepository.save(
                    Stock.builder()
                            .symbol(normalizedSymbol)
                            .companyName(
                                    "TCS".equals(normalizedSymbol)
                                            ? "Tata Consultancy Services Limited"
                                            : normalizedSymbol
                            )
                            .exchange(
                                    "TCS".equals(normalizedSymbol)
                                            ? "BSE"
                                            : "NSE"
                            )
                            .build()
            );
        }

        // Insert only dates that are not already stored.
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

        System.out.println(
                "Saved " + newPrices.size()
                        + " new records for " + normalizedSymbol
        );

        return historicalPriceRepository
                .findByStockOrderByTradingDateAsc(stock);
    }

    private List<MarketBar> fetchAlphaVantage(String symbol)
            throws Exception {

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                    "Alpha Vantage API key is not configured"
            );
        }

        String providerSymbol = resolveAlphaVantageSymbol(symbol);

        System.out.println(
                "ALPHA VANTAGE PROVIDER SYMBOL: " + providerSymbol
        );

        String url = UriComponentsBuilder
                .fromUriString(baseUrl)
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

            String providerError;

            if (root.has("Error Message")) {
                providerError = root.get("Error Message").asText();
            } else if (root.has("Note")) {
                providerError = root.get("Note").asText();
            } else {
                providerError = root.get("Information").asText();
            }

            System.err.println(
                    "Alpha Vantage provider error for " + providerSymbol
                            + ": " + providerError
            );

            throw new IllegalStateException(
                    "Alpha Vantage rejected the request: " + providerError
            );
        }

        JsonNode series = root.get("Time Series (Daily)");

        if (series == null || !series.fields().hasNext()) {
            throw new IllegalStateException(
                    "No daily time series returned for provider symbol "
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

    private List<MarketBar> fetchTejHQ(String symbol)
            throws Exception {

        if (!"RELIANCE".equals(symbol)) {
            throw new IllegalArgumentException(
                    "TejHQ supports only RELIANCE in this integration"
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

        String response = restTemplate.getForObject(
                url,
                String.class
        );

        if (response == null || response.isBlank()) {
            throw new IllegalStateException(
                    "TejHQ returned an empty response"
            );
        }

        JsonNode root = objectMapper.readTree(response);
        JsonNode data = root.path("data");

        if (root.has("error")
                || !data.isArray()
                || data.isEmpty()) {
            throw new IllegalStateException(
                    "TejHQ returned no usable historical data"
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
                    "TejHQ returned no usable price records"
            );
        }

        return bars;
    }

    private synchronized String getRateLimitedResponse(String url)
            throws InterruptedException {

        // Keep at least 1.2 seconds between provider requests.
        long waitMillis = 1200L
                - (System.currentTimeMillis() - lastRequestTimeMillis);

        if (waitMillis > 0) {
            Thread.sleep(waitMillis);
        }

        lastRequestTimeMillis = System.currentTimeMillis();

        return restTemplate.getForObject(url, String.class);
    }

    private String resolveAlphaVantageSymbol(String symbol) {

        Map<String, String> symbols = Map.of(
                "RELIANCE", relianceSymbol,
                "TCS", tcsSymbol,
                "INFY", infySymbol,
                "HDFCBANK", hdfcSymbol
        );

        String providerSymbol = symbols.get(symbol);

        if (providerSymbol == null || providerSymbol.isBlank()) {
            throw new IllegalArgumentException(
                    "Alpha Vantage symbol is not configured for " + symbol
            );
        }

        return providerSymbol.trim();
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

        if (value == null
                || value.isNull()
                || value.asText().isBlank()
                || (!value.isNumber() && !value.isTextual())) {

            throw new IllegalStateException(
                    "Missing or invalid market-data field: " + fieldName
            );
        }

        return new BigDecimal(value.asText());
    }

    private Long readVolume(JsonNode node, String fieldName) {

        JsonNode value = node.get(fieldName);

        if (value == null
                || value.isNull()
                || !value.canConvertToLong()) {

            throw new IllegalStateException(
                    "Missing or invalid market-data field: " + fieldName
            );
        }

        return value.asLong();
    }

    private String safeErrorMessage(Exception exception) {

        String message = exception.getMessage();

        if (message == null) {
            message = "No additional details";
        }

        // Redact API key if it appears in an exception message.
        return message.replaceAll(
                "(?i)(apikey=)[^&\\s]+",
                "$1[REDACTED]"
        );
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
