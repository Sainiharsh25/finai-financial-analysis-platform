package com.finai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class PortfolioSummaryResponse {

    private BigDecimal totalValue;
    private BigDecimal investedValue;
    private BigDecimal totalProfitLoss;
    private BigDecimal totalReturn;
    private int totalHoldings;
}