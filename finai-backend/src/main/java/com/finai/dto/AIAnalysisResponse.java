package com.finai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class AIAnalysisResponse {

    private String symbol;

    private BigDecimal rsi;
    private BigDecimal ema20;

    private BigDecimal macd;
    private BigDecimal macdSignal;
    private BigDecimal macdHistogram;

    private BigDecimal bollingerUpper;
    private BigDecimal bollingerMiddle;
    private BigDecimal bollingerLower;

    private String aiExplanation;
}