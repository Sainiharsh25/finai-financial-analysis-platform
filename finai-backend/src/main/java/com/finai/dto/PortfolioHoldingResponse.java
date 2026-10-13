package com.finai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class PortfolioHoldingResponse {

    private String symbol;
    private String companyName;

    private Integer quantity;
    private BigDecimal averageBuyPrice;

    private BigDecimal currentPrice;

    private BigDecimal investedValue;
    private BigDecimal currentValue;

    private BigDecimal profitLoss;
    private BigDecimal returnPercent;
}