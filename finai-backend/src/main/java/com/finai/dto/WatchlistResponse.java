package com.finai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class WatchlistResponse {

    private String symbol;
    private String companyName;
    private String exchange;
    private BigDecimal currentPrice;
    private BigDecimal previousClose;
    private BigDecimal priceChange;
    private BigDecimal changePercent;
    private LocalDateTime addedAt;
}