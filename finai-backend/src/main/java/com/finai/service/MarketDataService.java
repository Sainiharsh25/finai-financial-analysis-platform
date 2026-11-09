
package com.finai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finai.entity.HistoricalPrice;
import com.finai.entity.Stock;
import com.finai.repository.HistoricalPriceRepository;
import com.finai.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class MarketDataService {

    private static final String TEJHQ_BASE_URL =
            "https://api.tejhq.dev/v1/ohlcv";

    private static final String EXCHANGE = "nse";

    private static final int CACHE_VALIDITY_DAYS = 5;

    private static final int HISTORY_DAYS = 365;

    private static final ZoneId INDIA_ZONE =
            ZoneId.of("Asia/Kolkata");

    private final StockRepository stockRepository;

    private final HistoricalPriceRepository historicalPriceRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Fetch daily market prices from TejHQ.
     *
     * 1. Normalize the stock symbol.
     * 2. Check the local database cache.
     * 3. Return recent cached data when available.
     * 4. Fetch historical OHLCV from TejHQ when required.
     * 5. Save missing trading dates.
     * 6. Return all stored historical prices.
     */
    @Transactional
    public List<HistoricalPrice> fetchAndSaveDailyPrices(String symbol)
            throws Exception {

        String normalizedSymbol = normalizeSymbol(symbol);

        System.out.println("======================================");
        System.out.println("MARKET DATA PROVIDER: TEJHQ");
        System.out.println("STOCK SYMBOL: " + normalizedSymbol);
        System.out.println("EXCHANGE: NSE");
        System.out.println("======================================");

        Stock stock = stockRepository
                .findBySymbol(normalizedSymbol)
                .orElse(null);

        List<HistoricalPrice> cached = stock == null
                ? new ArrayList<>()
                : historicalPriceRepository
                .findByStockOrderByTradingDateAsc(stock);

        LocalDate today = LocalDate.now(INDIA_ZONE);

        LocalDate latestCachedDate = cached.isEmpty()
                ? null
                : cached.get(cached.size() - 1).getTradingDate();

        boolean cacheIsRecent = latestCachedDate != null
                && !latestCachedDate.isBefore(
                today.minusDays(CACHE_VALIDITY_DAYS)
        );

        if (cacheIsRecent) {

            System.out.println(
                    "CACHE HIT: " + normalizedSymbol
                            + " | Latest date: " + latestCachedDate
            );

            return cached;
        }

        System.out.println(
                "CACHE MISS: Fetching TejHQ data for "
                        + normalizedSymbol
        );

        List<MarketBar> bars;

        try {

            bars = fetchTejHQ(normalizedSymbol);

        } catch (Exception exception) {

            System.err.println(
                    "TEJHQ ERROR: " + normalizedSymbol
                            + " | " + safeErrorMessage(exception)
            );

            if (!cached.isEmpty()) {

                System.out.println(
                        "Using existing cached prices for "
                                + normalizedSymbol
                );

                return cached;
            }

            throw new IllegalStateException(
                    "Unable to fetch historical prices for "
                            + normalizedSymbol
                            + ". No cached prices are available.",
                    exception
            );
        }

        if (bars.isEmpty()) {

            if (!cached.isEmpty()) {
                return cached;
            }

            throw new IllegalStateException(
                    "TejHQ returned no historical prices for "
                            + normalizedSymbol
            );
        }

        bars = bars.stream()
                .sorted(Comparator.comparing(MarketBar::date))
                .toList();

        if (stock == null) {

            stock = stockRepository.save(
                    Stock.builder()
                            .symbol(normalizedSymbol)
                            .companyName(
                                    getCompanyName(normalizedSymbol)
                            )
                            .exchange("NSE")
                            .build()
            );
        }

        List<HistoricalPrice> newPrices = new ArrayList<>();

        for (MarketBar bar : bars) {

            boolean alreadyExists =
                    historicalPriceRepository
                            .existsByStockAndTradingDate(
                                    stock,
                                    bar.date()
                            );

            if (alreadyExists) {
                continue;
            }

            HistoricalPrice historicalPrice =
                    HistoricalPrice.builder()
                            .stock(stock)
                            .tradingDate(bar.date())
                            .openPrice(bar.open())
                            .highPrice(bar.high())
                            .lowPrice(bar.low())
                            .closePrice(bar.close())
                            .volume(bar.volume())
                            .build();

            newPrices.add(historicalPrice);
        }

        if (!newPrices.isEmpty()) {

            historicalPriceRepository.saveAll(newPrices);

            historicalPriceRepository.flush();
        }

        System.out.println(
                "TEJHQ RECORDS RECEIVED: " + bars.size()
        );

        System.out.println(
                "NEW RECORDS SAVED: " + newPrices.size()
        );

        System.out.println(
                "STOCK: " + normalizedSymbol
        );

        return historicalPriceRepository
                .findByStockOrderByTradingDateAsc(stock);
    }

    /**
     * Fetch daily NSE historical prices from TejHQ.
     *
     * Endpoint:
     * GET /v1/ohlcv/nse/{symbol}?from=YYYY-MM-DD&to=YYYY-MM-DD
     *
     * This endpoint does not require an API key.
     */
    private List<MarketBar> fetchTejHQ(String symbol)
            throws Exception {

        LocalDate to = LocalDate.now(INDIA_ZONE);

        LocalDate from = to.minusDays(HISTORY_DAYS);

        String url = UriComponentsBuilder
                .fromUriString(
                        TEJHQ_BASE_URL + "/{exchange}/{symbol}"
                )
                .queryParam("from", from)
                .queryParam("to", to)
                .buildAndExpand(EXCHANGE, symbol)
                .encode()
                .toUriString();

        System.out.println(
                "TEJHQ REQUEST: " + EXCHANGE + "/" + symbol
        );

        String response;

        try {

            response = restTemplate.getForObject(
                    url,
                    String.class
            );

        } catch (RestClientException exception) {

            throw new IllegalStateException(
                    "TejHQ HTTP request failed for " + symbol,
                    exception
            );
        }

        if (response == null || response.isBlank()) {

            throw new IllegalStateException(
                    "TejHQ returned an empty response for " + symbol
            );
        }

        JsonNode root = objectMapper.readTree(response);

        if (root.has("error")) {

            throw new IllegalStateException(
                    "TejHQ API error: "
                            + root.path("error").asText()
            );
        }

        JsonNode data = root.path("data");

        if (!data.isArray()) {

            throw new IllegalStateException(
                    "Invalid TejHQ response: data is not an array"
            );
        }

        if (data.isEmpty()) {

            throw new IllegalStateException(
                    "No historical data available for " + symbol
            );
        }

        List<MarketBar> bars = new ArrayList<>();

        for (JsonNode row : data) {

            String dateText = row.path("date").asText("");

            if (dateText.isBlank()) {
                continue;
            }

            LocalDate tradingDate;

            try {

                tradingDate = LocalDate.parse(dateText);

            } catch (Exception exception) {

                System.err.println(
                        "Skipping invalid trading date: " + dateText
                );

                continue;
            }

            BigDecimal open = readDecimal(row, "open");
            BigDecimal high = readDecimal(row, "high");
            BigDecimal low = readDecimal(row, "low");
            BigDecimal close = readDecimal(row, "close");

            Long volume = readVolume(row, "volume");

            bars.add(
                    new MarketBar(
                            tradingDate,
                            open,
                            high,
                            low,
                            close,
                            volume
                    )
            );
        }

        if (bars.isEmpty()) {

            throw new IllegalStateException(
                    "TejHQ returned no valid OHLCV records for " + symbol
            );
        }

        return bars;
    }

    /**
     * Normalize stock symbols.
     */
    private String normalizeSymbol(String symbol) {

        if (symbol == null || symbol.isBlank()) {

            throw new IllegalArgumentException(
                    "Stock symbol is required"
            );
        }

        return symbol.trim().toUpperCase(Locale.ROOT);
    }

    /**
     * Company names used when creating new stock records.
     */
    private String getCompanyName(String symbol) {

        return switch (symbol) {

            case "RELIANCE" ->
                    "Reliance Industries Limited";

            case "TCS" ->
                    "Tata Consultancy Services Limited";

            case "INFY" ->
                    "Infosys Limited";

            case "HDFCBANK" ->
                    "HDFC Bank Limited";

            default ->
                    symbol;
        };
    }

    /**
     * Safely read decimal values from the JSON response.
     */
    private BigDecimal readDecimal(
            JsonNode node,
            String fieldName
    ) {

        JsonNode value = node.get(fieldName);

        if (value == null
                || value.isNull()
                || !value.isValueNode()
                || value.asText().isBlank()) {

            throw new IllegalStateException(
                    "Missing or invalid market-data field: "
                            + fieldName
            );
        }

        try {

            return new BigDecimal(value.asText());

        } catch (NumberFormatException exception) {

            throw new IllegalStateException(
                    "Invalid decimal value for field: " + fieldName,
                    exception
            );
        }
    }

    /**
     * Safely read trading volume.
     */
    private Long readVolume(
            JsonNode node,
            String fieldName
    ) {

        JsonNode value = node.get(fieldName);

        if (value == null
                || value.isNull()
                || !value.isValueNode()
                || value.asText().isBlank()) {

            throw new IllegalStateException(
                    "Missing or invalid market-data field: "
                            + fieldName
            );
        }

        try {

            return Long.parseLong(value.asText());

        } catch (NumberFormatException exception) {

            throw new IllegalStateException(
                    "Invalid volume value",
                    exception
            );
        }
    }

    /**
     * Prevent sensitive information from being exposed in logs.
     */
    private String safeErrorMessage(Exception exception) {

        String message = exception.getMessage();

        if (message == null || message.isBlank()) {
            return "No additional details";
        }

        return message.replaceAll(
                "(?i)(apikey=)[^&\\s]+",
                "$1[REDACTED]"
        );
    }

    /**
     * Internal market-data representation.
     */
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
