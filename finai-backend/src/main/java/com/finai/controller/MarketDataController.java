package com.finai.controller;

import com.finai.entity.HistoricalPrice;
import com.finai.service.MarketDataService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/market-data")
public class MarketDataController {

    private final MarketDataService marketDataService;

    public MarketDataController(MarketDataService marketDataService) {
        this.marketDataService = marketDataService;
    }

    @PostMapping("/{symbol}")
    public ResponseEntity<List<HistoricalPrice>> fetchMarketData(
            @PathVariable String symbol) throws Exception {

        return ResponseEntity.ok(
                marketDataService.fetchAndSaveDailyPrices(symbol)
        );
    }
}