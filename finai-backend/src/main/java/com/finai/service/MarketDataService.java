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
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class MarketDataService {

    @Value("${alphavantage.api.key}")
    private String apiKey;

    @Value("${alphavantage.base.url}")
    private String baseUrl;

    private final StockRepository stockRepository;
    private final HistoricalPriceRepository historicalPriceRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public List<HistoricalPrice> fetchAndSaveDailyPrices(String symbol)
            throws Exception {

        String normalizedSymbol = normalizeSymbol(symbol);

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                    "Alpha Vantage API key is not configured"
            );
        }

        if (baseUrl == null || baseUrl.isBlank()) {
            throw new IllegalStateException(
                    "Alpha Vantage base URL is not configured"
            );
        }

        Stock stock = stockRepository.findBySymbol(normalizedSymbol)
                .orElseGet(() -> stockRepository.save(
                        Stock.builder()
                                .symbol(normalizedSymbol)
                                .companyName(normalizedSymbol)
                                .exchange("BSE")
                                .build()
                ));

        String url = UriComponentsBuilder.fromUriString(baseUrl)
                .queryParam("function", "TIME_SERIES_DAILY")
                .queryParam("symbol", normalizedSymbol)
                .queryParam("outputsize", "compact")
                .queryParam("apikey", apiKey)
                .build()
                .encode()
                .toUriString();

        String response = restTemplate.getForObject(url, String.class);

        if (response == null || response.isBlank()) {
            throw new IllegalStateException(
                    "Alpha Vantage returned an empty response"
            );
        }

        JsonNode root = objectMapper.readTree(response);

        if (root.has("Error Message")) {
            throw new IllegalStateException(
                    "Alpha Vantage rejected symbol "
                            + normalizedSymbol + ": "
                            + root.get("Error Message").asText()
            );
        }

        if (root.has("Note") || root.has("Information")) {
            String message = root.has("Note")
                    ? root.get("Note").asText()
                    : root.get("Information").asText();

            throw new IllegalStateException(
                    "Alpha Vantage limit or notice: " + message
            );
        }

        JsonNode timeSeries = root.get("Time Series (Daily)");

        if (timeSeries == null || !timeSeries.fields().hasNext()) {
            throw new IllegalStateException(
                    "No daily market data returned for " + normalizedSymbol
                            + ". Check provider symbol support and response."
            );
        }

        List<HistoricalPrice> newPrices = new ArrayList<>();
        var fields = timeSeries.fields();

        while (fields.hasNext()) {
            var entry = fields.next();

            LocalDate tradingDate = LocalDate.parse(entry.getKey());

            if (historicalPriceRepository
                    .existsByStockAndTradingDate(stock, tradingDate)) {
                continue;
            }

            JsonNode daily = entry.getValue();

            HistoricalPrice price = HistoricalPrice.builder()
                    .stock(stock)
                    .tradingDate(tradingDate)
                    .openPrice(readDecimal(daily, "1. open"))
                    .highPrice(readDecimal(daily, "2. high"))
                    .lowPrice(readDecimal(daily, "3. low"))
                    .closePrice(readDecimal(daily, "4. close"))
                    .volume(readVolume(daily, "5. volume"))
                    .build();

            newPrices.add(price);
        }

        if (!newPrices.isEmpty()) {
            historicalPriceRepository.saveAll(newPrices);
            historicalPriceRepository.flush();
        }

        return historicalPriceRepository
                .findByStockOrderByTradingDateAsc(stock);
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

        if (value == null || value.isNull() || value.asText().isBlank()) {
            throw new IllegalStateException(
                    "Missing market-data field: " + fieldName
            );
        }

        try {
            return new BigDecimal(value.asText());
        } catch (NumberFormatException exception) {
            throw new IllegalStateException(
                    "Invalid market-data value for " + fieldName,
                    exception
            );
        }
    }

    private Long readVolume(JsonNode node, String fieldName) {
        JsonNode value = node.get(fieldName);

        if (value == null || value.isNull() || !value.canConvertToLong()) {
            throw new IllegalStateException(
                    "Missing or invalid market-data field: " + fieldName
            );
        }

        return value.asLong();
    }
}
