package com.finai.controller;

import com.finai.dto.StockRequest;
import com.finai.entity.Stock;
import com.finai.service.StockService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    @PostMapping
    public ResponseEntity<Stock> addStock(
            @RequestBody StockRequest request) {

        return ResponseEntity.ok(
                stockService.addStock(request)
        );
    }

    @GetMapping
    public ResponseEntity<List<Stock>> getAllStocks() {

        return ResponseEntity.ok(
                stockService.getAllStocks()
        );
    }

    @GetMapping("/{symbol}")
    public ResponseEntity<Stock> getStock(
            @PathVariable String symbol) {

        return ResponseEntity.ok(
                stockService.getStockBySymbol(symbol)
        );
    }

    @DeleteMapping("/{symbol}")
    public ResponseEntity<String> deleteStock(
            @PathVariable String symbol) {

        stockService.deleteStock(symbol);

        return ResponseEntity.ok(
                "Stock deleted successfully"
        );
    }
}