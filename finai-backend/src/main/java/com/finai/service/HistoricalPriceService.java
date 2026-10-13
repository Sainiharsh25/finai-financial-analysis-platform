package com.finai.service;

import com.finai.dto.BulkHistoricalPriceRequest;
import com.finai.dto.HistoricalPriceRequest;
import com.finai.entity.HistoricalPrice;
import com.finai.entity.Stock;
import com.finai.repository.HistoricalPriceRepository;
import com.finai.repository.StockRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HistoricalPriceService {

    private final HistoricalPriceRepository historicalPriceRepository;
    private final StockRepository stockRepository;

    public List<HistoricalPrice> addBulkPrices(
            BulkHistoricalPriceRequest request) {

        Stock stock = stockRepository
                .findBySymbol(request.getSymbol().toUpperCase())
                .orElseThrow(() ->
                        new RuntimeException("Stock not found"));

        List<HistoricalPrice> prices = request.getPrices()
                .stream()
                .map(priceRequest -> HistoricalPrice.builder()
                        .stock(stock)
                        .tradingDate(priceRequest.getTradingDate())
                        .openPrice(priceRequest.getOpenPrice())
                        .highPrice(priceRequest.getHighPrice())
                        .lowPrice(priceRequest.getLowPrice())
                        .closePrice(priceRequest.getClosePrice())
                        .volume(priceRequest.getVolume())
                        .build())
                .toList();

        return historicalPriceRepository.saveAll(prices);
    }

    public HistoricalPrice addPrice(
            HistoricalPriceRequest request) {

        Stock stock = stockRepository
                .findBySymbol(request.getSymbol().toUpperCase())
                .orElseThrow(() ->
                        new RuntimeException("Stock not found"));

        HistoricalPrice price = HistoricalPrice.builder()
                .stock(stock)
                .tradingDate(request.getTradingDate())
                .openPrice(request.getOpenPrice())
                .highPrice(request.getHighPrice())
                .lowPrice(request.getLowPrice())
                .closePrice(request.getClosePrice())
                .volume(request.getVolume())
                .build();

        return historicalPriceRepository.save(price);
    }

    public List<HistoricalPrice> getPrices(
            String symbol) {

        Stock stock = stockRepository
                .findBySymbol(symbol.toUpperCase())
                .orElseThrow(() ->
                        new RuntimeException("Stock not found"));

        return historicalPriceRepository
                .findByStockOrderByTradingDateAsc(stock);
    }

    public List<HistoricalPrice> getPricesBetween(
            String symbol,
            LocalDate startDate,
            LocalDate endDate) {

        Stock stock = stockRepository
                .findBySymbol(symbol.toUpperCase())
                .orElseThrow(() ->
                        new RuntimeException("Stock not found"));

        return historicalPriceRepository
                .findByStockAndTradingDateBetweenOrderByTradingDateAsc(
                        stock,
                        startDate,
                        endDate
                );
    }

}