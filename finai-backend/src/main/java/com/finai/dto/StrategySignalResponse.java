package com.finai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class StrategySignalResponse {

    private String symbol;
    private String strategy;
    private BigDecimal indicatorValue;
    private String signal;
    private String reason;
}