package com.finai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finai.entity.HistoricalPrice;
import com.finai.entity.Stock;
import com.finai.repository.HistoricalPriceRepository;
import com.finai.repository.StockRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class MarketDataService {

    @Value("${alphavantage.api.key}")
    private String apiKey;

    @Value("${alphavantage.base.url}")
    private String baseUrl;

    private final StockRepository stockRepository;
    private final HistoricalPriceRepository historicalPriceRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public MarketDataService(
            StockRepository stockRepository,
            HistoricalPriceRepository historicalPriceRepository) {

        this.stockRepository = stockRepository;
        this.historicalPriceRepository = historicalPriceRepository;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    @Transactional
    public List<HistoricalPrice> fetchAndSaveDailyPrices(String symbol)
            throws Exception {

        if (symbol == null || symbol.isBlank()) {
            throw new IllegalArgumentException("Stock symbol is required");
        }

        String normalizedSymbol = symbol.trim().toUpperCase();

        // Create the stock record if it does not exist.
        Stock stock = stockRepository.findBySymbol(normalizedSymbol)
                .orElseGet(() -> {
                    Stock newStock = Stock.builder()
                            .symbol(normalizedSymbol)
                            .companyName(normalizedSymbol)
                            .exchange("BSE")
                            .build();

                    return stockRepository.save(newStock);
                });

        // Do not assume an exchange suffix is valid for Alpha Vantage.
        // Pass the supplied ticker as-is and validate the API response.
        String url = UriComponentsBuilder
                .fromUriString(baseUrl)
                .queryParam("function", "TIME_SERIES_DAILY")
                .queryParam("symbol", normalizedSymbol)
                .queryParam("outputsize", "compact")
                .queryParam("apikey", apiKey)
                .build()
                .encode()
                .toUriString();

        String response = restTemplate.getForObject(url, String.class);

        if (response == null || response.isBlank()) {
            throw new RuntimeException("Alpha Vantage returned an empty response");
        }

        JsonNode root = objectMapper.readTree(response);

        if (root.has("Error Message")) {
            throw new RuntimeException(
                    "Alpha Vantage error: "
                            + root.get("Error Message").asText());
        }

        if (root.has("Note") || root.has("Information")) {
            String message = root.has("Note")
                    ? root.get("Note").asText()
                    : root.get("Information").asText();

            throw new RuntimeException(
                    "Alpha Vantage API notice or limit: " + message);
        }

        JsonNode timeSeries = root.get("Time Series (Daily)");

        if (timeSeries == null || !timeSeries.fields().hasNext()) {
            throw new RuntimeException(
                    "No daily market data returned for "
                            + normalizedSymbol
                            + ". Verify the ticker is supported by your API plan.");
        }

        List<HistoricalPrice> prices = new ArrayList<>();

        var fields = timeSeries.fields();

        while (fields.hasNext()) {
            var entry = fields.next();

            LocalDate date = LocalDate.parse(entry.getKey());

            if (historicalPriceRepository
                    .existsByStockAndTradingDate(stock, date)) {
                continue;
            }

            JsonNode dailyData = entry.getValue();

            HistoricalPrice price = HistoricalPrice.builder()
                    .stock(stock)
                    .tradingDate(date)
                    .openPrice(new BigDecimal(
                            dailyData.get("1. open").asText()))
                    .highPrice(new BigDecimal(
                            dailyData.get("2. high").asText()))
                    .lowPrice(new BigDecimal(
                            dailyData.get("3. low").asText()))
                    .closePrice(new BigDecimal(
                            dailyData.get("4. close").asText()))
                    .volume(dailyData.get("5. volume").asLong())
                    .build();

            prices.add(price);
        }

        if (prices.isEmpty()) {
            // Existing records may already cover the requested data.
            return historicalPriceRepository
                    .findByStockOrderByTradingDateAsc(stock);
        }

        return historicalPriceRepository.saveAll(prices);
    }
}
