package com.finai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class BollingerStrategyResponse {

    private String symbol;
    private String strategy;
    private BigDecimal currentPrice;
    private BigDecimal upperBand;
    private BigDecimal middleBand;
    private BigDecimal lowerBand;
    private String tradeSignal;
    private String reason;
}