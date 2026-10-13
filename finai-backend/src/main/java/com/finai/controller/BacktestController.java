package com.finai.controller;

import com.finai.dto.BacktestResponse;
import com.finai.dto.BollingerDebugResponse;
import com.finai.service.BacktestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/backtests")
public class BacktestController {

    private final BacktestService backtestService;

    public BacktestController(
            BacktestService backtestService) {

        this.backtestService = backtestService;
    }

    @GetMapping("/{symbol}/rsi")
    public ResponseEntity<BacktestResponse> backtestRSI(
            @PathVariable String symbol,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate,
            @RequestParam BigDecimal initialCapital) {

        return ResponseEntity.ok(
                backtestService.backtestRSI(
                        symbol,
                        startDate,
                        endDate,
                        initialCapital
                )
        );
    }


    @GetMapping("/{symbol}/ema-crossover")
    public ResponseEntity<BacktestResponse> backtestEMACrossover(
            @PathVariable String symbol,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate,
            @RequestParam BigDecimal initialCapital) {

        return ResponseEntity.ok(
                backtestService.backtestEMACrossover(
                        symbol,
                        startDate,
                        endDate,
                        initialCapital
                )
        );
    }

    @GetMapping("/{symbol}/macd")
    public ResponseEntity<BacktestResponse> backtestMACD(
            @PathVariable String symbol,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate,
            @RequestParam BigDecimal initialCapital) {

        return ResponseEntity.ok(
                backtestService.backtestMACD(
                        symbol,
                        startDate,
                        endDate,
                        initialCapital
                )
        );
    }

    @GetMapping("/{symbol}/bollinger")
    public ResponseEntity<BacktestResponse> backtestBollinger(
            @PathVariable String symbol,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate,
            @RequestParam BigDecimal initialCapital) {

        return ResponseEntity.ok(
                backtestService.backtestBollinger(
                        symbol,
                        startDate,
                        endDate,
                        initialCapital
                )
        );
    }

}