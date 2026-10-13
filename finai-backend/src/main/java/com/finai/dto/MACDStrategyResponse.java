package com.finai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class MACDStrategyResponse {

    private String symbol;
    private String strategy;
    private BigDecimal macd;
    private BigDecimal signalLine;
    private BigDecimal histogram;
    private String tradeSignal;
    private String reason;
}