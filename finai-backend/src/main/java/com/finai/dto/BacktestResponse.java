package com.finai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
public class BacktestResponse {

    private String symbol;

    private String strategy;

    private BigDecimal initialCapital;

    private BigDecimal finalCapital;

    private BigDecimal totalReturn;

    private int totalTrades;

    private int winningTrades;

    private BigDecimal winRate;

    private BigDecimal totalProfitLoss;

    private BigDecimal averageProfit;

    private BigDecimal averageLoss;

    private BigDecimal profitFactor;

    private BigDecimal maxDrawdown;

    // Trade history
    private List<BacktestTradeResponse> trades;
}