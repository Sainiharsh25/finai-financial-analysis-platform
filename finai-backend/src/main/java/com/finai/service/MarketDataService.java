package com.finai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finai.entity.HistoricalPrice;
import com.finai.entity.Stock;
import com.finai.repository.HistoricalPriceRepository;
import com.finai.repository.StockRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

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

    public List<HistoricalPrice> fetchAndSaveDailyPrices(String symbol)
            throws Exception {

        Stock stock = stockRepository
                .findBySymbol(symbol.toUpperCase())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Stock not found: " + symbol));
        String apiSymbol = symbol.toUpperCase() + ".BSE";

        String url = baseUrl
                + "?function=TIME_SERIES_DAILY"
                + "&symbol=" + apiSymbol
                + "&outputsize=compact"
                + "&apikey=" + apiKey;

        String response = restTemplate.getForObject(
                url,
                String.class
        );

        JsonNode root = objectMapper.readTree(response);

        if (root.has("Error Message")) {
            throw new RuntimeException(
                    root.get("Error Message").asText()
            );
        }

        if (root.has("Note")) {
            throw new RuntimeException(
                    "Alpha Vantage API limit reached: "
                            + root.get("Note").asText()
            );
        }

        JsonNode timeSeries =
                root.get("Time Series (Daily)");

        if (timeSeries == null) {
            throw new RuntimeException(
                    "No daily market data found."
            );
        }

        List<HistoricalPrice> prices = new ArrayList<>();

        timeSeries.fields().forEachRemaining(entry -> {

            try {

                LocalDate date =
                        LocalDate.parse(entry.getKey());

                if (historicalPriceRepository
                        .existsByStockAndTradingDate(stock, date)) {
                    return;
                }

                JsonNode dailyData = entry.getValue();

                HistoricalPrice price =
                        HistoricalPrice.builder()
                                .stock(stock)
                                .tradingDate(date)
                                .openPrice(
                                        new BigDecimal(
                                                dailyData
                                                        .get("1. open")
                                                        .asText()
                                        )
                                )
                                .highPrice(
                                        new BigDecimal(
                                                dailyData
                                                        .get("2. high")
                                                        .asText()
                                        )
                                )
                                .lowPrice(
                                        new BigDecimal(
                                                dailyData
                                                        .get("3. low")
                                                        .asText()
                                        )
                                )
                                .closePrice(
                                        new BigDecimal(
                                                dailyData
                                                        .get("4. close")
                                                        .asText()
                                        )
                                )
                                .volume(
                                        dailyData
                                                .get("5. volume")
                                                .asLong()
                                )
                                .build();

                prices.add(price);

            } catch (Exception e) {
                throw new RuntimeException(
                        "Error processing market data",
                        e
                );
            }
        });

        return historicalPriceRepository.saveAll(prices);
    }
}