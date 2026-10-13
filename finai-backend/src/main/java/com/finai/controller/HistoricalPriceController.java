package com.finai.controller;

import com.finai.dto.BulkHistoricalPriceRequest;
import com.finai.dto.HistoricalPriceRequest;
import com.finai.entity.HistoricalPrice;
import com.finai.service.HistoricalPriceService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/prices")
@RequiredArgsConstructor
public class HistoricalPriceController {

    private final HistoricalPriceService historicalPriceService;

    @PostMapping
    public ResponseEntity<HistoricalPrice> addPrice(
            @RequestBody HistoricalPriceRequest request) {

        return ResponseEntity.ok(
                historicalPriceService.addPrice(request)
        );
    }

    @GetMapping("/{symbol}")
    public ResponseEntity<List<HistoricalPrice>> getPrices(
            @PathVariable String symbol) {

        return ResponseEntity.ok(
                historicalPriceService.getPrices(symbol)
        );
    }
    @PostMapping("/bulk")
    public ResponseEntity<List<HistoricalPrice>> addBulkPrices(
            @RequestBody BulkHistoricalPriceRequest request) {

        return ResponseEntity.ok(
                historicalPriceService.addBulkPrices(request)
        );
    }

    @GetMapping("/{symbol}/range")
    public ResponseEntity<List<HistoricalPrice>> getPricesBetween(
            @PathVariable String symbol,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {

        return ResponseEntity.ok(
                historicalPriceService.getPricesBetween(
                        symbol,
                        startDate,
                        endDate
                )
        );
    }
}