
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

    private static final int MIN_CACHED_RECORDS = 100;

    @Value("${alphavantage.api.key:}")
    private String apiKey;

    @Value("${alphavantage.base.url:https://www.alphavantage.co/query}")
    private String baseUrl;

    @Value("${alphavantage.symbol.RELIANCE:RELIANCE}")
    private String relianceSymbol;

    @Value("${alphavantage.symbol.TCS:TCS}")
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

        System.out.println(
                "MARKET DATA VERSION: ALPHA VANTAGE PRIMARY"
        );
        System.out.println(
                "NORMALIZED SYMBOL: [" + normalizedSymbol + "]"
        );

        Stock stock = stockRepository.findBySymbol(normalizedSymbol)
                .orElse(null);

        List<HistoricalPrice> cached = stock == null
                ? new ArrayList<>()
                : historicalPriceRepository
                .findByStockOrderByTradingDateAsc(stock);

        // Avoid unnecessary API calls when the database
        // already contains 100 or more historical records.
        if (cached.size() >= MIN_CACHED_RECORDS) {
            System.out.println(
                    "Returning " + cached.size()
                            + " cached records for " + normalizedSymbol
            );
            return cached;
        }

        List<MarketBar> bars = List.of();
        Exception providerFailure = null;

        // 1. Alpha Vantage is the primary provider.
        try {
            bars = fetchAlphaVantage(normalizedSymbol);

        } catch (Exception exception) {
            providerFailure = exception;

            System.err.println(
                    "Alpha Vantage failed for " + normalizedSymbol
                            + ": " + safeErrorMessage(exception)
            );
        }

        // 2. TejHQ is only a fallback for RELIANCE.
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

        // 3. Use cached records if providers are unavailable.
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
                            + ". Check provider availability and symbol support.",
                    providerFailure
            );
        }

        bars = bars.stream()
                .sorted(Comparator.comparing(MarketBar::date))
                .toList();

        if (stock == null) {
            stock = stockRepository.save(
                    Stock.builder()
                            .symbol(normalizedSymbol)
                            .companyName(normalizedSymbol)
                            .exchange("NSE")
                            .build()
            );
        }

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

            // Do not log or expose the raw response:
            // provider messages may contain sensitive information.
            throw new IllegalStateException(
                    "Alpha Vantage rejected the request. "
                            + "Check symbol support, API quota and API key."
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

        // Alpha Vantage free tier has a daily quota.
        // This delay also avoids rapid consecutive calls.
        long waitMillis =
                1200L - (System.currentTimeMillis()
                        - lastRequestTimeMillis);

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

    private BigDecimal readDecimal(
            JsonNode node,
            String fieldName
    ) {

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

    private Long readVolume(
            JsonNode node,
            String fieldName
    ) {

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

        // Never return the provider's raw URL or API response.
        // Alpha Vantage may echo the API key in its response.
        return exception.getClass().getSimpleName()
                + ": " + exception.getMessage()
                .replaceAll("(?i)(apikey=)[^&\\s]+", "$1[REDACTED]");
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
