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

        if (symbol == null || symbol.isBlank()) {
            throw new IllegalArgumentException("Stock symbol is required");
        }

        String normalizedSymbol = symbol.trim().toUpperCase();

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
            throw new RuntimeException("Alpha Vantage returned an empty response");
        }

        JsonNode root = objectMapper.readTree(response);

        if (root.has("Error Message")) {
            throw new RuntimeException(
                    "Alpha Vantage error: "
                            + root.get("Error Message").asText()
            );
        }

        if (root.has("Note") || root.has("Information")) {
            String message = root.has("Note")
                    ? root.get("Note").asText()
                    : root.get("Information").asText();

            throw new RuntimeException(
                    "Alpha Vantage API limit or notice: " + message
            );
        }

        JsonNode timeSeries = root.get("Time Series (Daily)");

        if (timeSeries == null || !timeSeries.fields().hasNext()) {
            throw new RuntimeException(
                    "No daily market data returned for " + normalizedSymbol
                            + ". Verify the symbol and API support."
            );
        }

        List<HistoricalPrice> newPrices = new ArrayList<>();
        var fields = timeSeries.fields();

        while (fields.hasNext()) {
            var entry = fields.next();
            LocalDate date = LocalDate.parse(entry.getKey());

            if (historicalPriceRepository
                    .existsByStockAndTradingDate(stock, date)) {
                continue;
            }

            JsonNode daily = entry.getValue();

            HistoricalPrice price = HistoricalPrice.builder()
                    .stock(stock)
                    .tradingDate(date)
                    .openPrice(new BigDecimal(daily.get("1. open").asText()))
                    .highPrice(new BigDecimal(daily.get("2. high").asText()))
                    .lowPrice(new BigDecimal(daily.get("3. low").asText()))
                    .closePrice(new BigDecimal(daily.get("4. close").asText()))
                    .volume(daily.get("5. volume").asLong())
                    .build();

            newPrices.add(price);
        }

        if (!newPrices.isEmpty()) {
            historicalPriceRepository.saveAll(newPrices);
        }

        return historicalPriceRepository
                .findByStockOrderByTradingDateAsc(stock);
    }
}
