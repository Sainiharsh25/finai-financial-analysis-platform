package com.finai.controller;

import com.finai.dto.BollingerStrategyResponse;
import com.finai.dto.MACDStrategyResponse;
import com.finai.dto.StrategySignalResponse;
import com.finai.service.StrategyService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/strategies")
public class StrategyController {

    private final StrategyService strategyService;

    public StrategyController(
            StrategyService strategyService) {

        this.strategyService = strategyService;
    }

    @GetMapping("/{symbol}/rsi")
    public ResponseEntity<StrategySignalResponse> rsiStrategy(
            @PathVariable String symbol) {

        return ResponseEntity.ok(
                strategyService
                        .calculateRSIStrategy(symbol)
        );
    }

    @GetMapping("/{symbol}/ema-crossover")
    public ResponseEntity<StrategySignalResponse> emaCrossoverStrategy(
            @PathVariable String symbol) {

        return ResponseEntity.ok(
                strategyService
                        .calculateEMACrossoverStrategy(symbol)
        );
    }

    @GetMapping("/{symbol}/macd")
    public ResponseEntity<MACDStrategyResponse> macdStrategy(
            @PathVariable String symbol) {

        return ResponseEntity.ok(
                strategyService.calculateMACDStrategy(symbol)
        );
    }

    @GetMapping("/{symbol}/bollinger")
    public ResponseEntity<BollingerStrategyResponse> bollingerStrategy(
            @PathVariable String symbol) {

        return ResponseEntity.ok(
                strategyService.calculateBollingerStrategy(symbol)
        );
    }
}