package com.finai.controller;

import com.finai.dto.BollingerBandsResponse;
import com.finai.dto.MACDResponse;
import com.finai.service.TechnicalIndicatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;


@RestController
@RequestMapping("/api/indicators")
@RequiredArgsConstructor
public class TechnicalIndicatorController {

    private final TechnicalIndicatorService indicatorService;

    @GetMapping("/{symbol}/sma")
    public ResponseEntity<List<BigDecimal>> getSMA(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "5") int period) {

        return ResponseEntity.ok(
                indicatorService.calculateSMA(
                        symbol,
                        period
                )
        );
    }

    @GetMapping("/{symbol}/rsi")
    public ResponseEntity<BigDecimal> getRSI(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "14") int period) {

        return ResponseEntity.ok(
                indicatorService.calculateRSI(
                        symbol,
                        period
                )
        );
    }

    @GetMapping("/{symbol}/ema")
    public ResponseEntity<BigDecimal> calculateEMA(
            @PathVariable String symbol,
            @RequestParam int period) {

        return ResponseEntity.ok(
                indicatorService
                        .calculateEMA(symbol, period)
        );
    }

    @GetMapping("/{symbol}/macd")
    public ResponseEntity<MACDResponse> calculateMACD(
            @PathVariable String symbol) {

        return ResponseEntity.ok(
                indicatorService.calculateMACD(symbol)
        );
    }

    @GetMapping("/{symbol}/bollinger")
    public ResponseEntity<BollingerBandsResponse> calculateBollingerBands(
            @PathVariable String symbol,
            @RequestParam int period) {

        return ResponseEntity.ok(
                indicatorService
                        .calculateBollingerBands(symbol, period)
        );
    }
}