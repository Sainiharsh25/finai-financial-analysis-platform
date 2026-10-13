package com.finai.service;

import com.finai.dto.StockRequest;
import com.finai.entity.Stock;
import com.finai.repository.StockRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StockService {

    private final StockRepository stockRepository;

    public Stock addStock(StockRequest request) {

        String symbol = request.getSymbol().toUpperCase();

        if (stockRepository.existsBySymbol(symbol)) {
            throw new RuntimeException("Stock already exists");
        }

        Stock stock = Stock.builder()
                .symbol(symbol)
                .companyName(request.getCompanyName())
                .exchange(request.getExchange())
                .build();

        return stockRepository.save(stock);
    }

    public List<Stock> getAllStocks() {

        return stockRepository.findAll();
    }

    public Stock getStockBySymbol(String symbol) {

        return stockRepository.findBySymbol(
                symbol.toUpperCase()
        ).orElseThrow(() ->
                new RuntimeException("Stock not found"));
    }

    public void deleteStock(String symbol) {

        Stock stock = stockRepository.findBySymbol(
                symbol.toUpperCase()
        ).orElseThrow(() ->
                new RuntimeException("Stock not found"));

        stockRepository.delete(stock);
    }
}