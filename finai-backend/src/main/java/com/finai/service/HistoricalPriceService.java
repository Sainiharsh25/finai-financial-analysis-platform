package com.finai.service;

import com.finai.dto.BulkHistoricalPriceRequest;
import com.finai.dto.HistoricalPriceRequest;
import com.finai.entity.HistoricalPrice;
import com.finai.entity.Stock;
import com.finai.repository.HistoricalPriceRepository;
import com.finai.repository.StockRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HistoricalPriceService {

    private final HistoricalPriceRepository historicalPriceRepository;
    private final StockRepository stockRepository;


    @Transactional
    public List<HistoricalPrice> addBulkPrices(
            BulkHistoricalPriceRequest request) {

        Stock stock = stockRepository
                .findBySymbol(request.getSymbol().trim().toUpperCase())
                .orElseThrow(() ->
                        new RuntimeException("Stock not found"));

        List<HistoricalPrice> existingPrices =
                historicalPriceRepository
                        .findByStockOrderByTradingDateAsc(stock);

        Set<LocalDate> existingDates = existingPrices.stream()
                .map(HistoricalPrice::getTradingDate)
                .collect(Collectors.toSet());

        List<HistoricalPrice> prices = request.getPrices().stream()
                .filter(p -> !existingDates.contains(p.getTradingDate()))
                .map(p -> HistoricalPrice.builder()
                        .stock(stock)
                        .tradingDate(p.getTradingDate())
                        .openPrice(p.getOpenPrice())
                        .highPrice(p.getHighPrice())
                        .lowPrice(p.getLowPrice())
                        .closePrice(p.getClosePrice())
                        .volume(p.getVolume())
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