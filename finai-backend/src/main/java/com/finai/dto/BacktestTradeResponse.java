package com.finai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class BacktestTradeResponse {

    private LocalDate tradeDate;

    private String action;

    private BigDecimal price;

    private int quantity;

    private BigDecimal profitLoss;
}