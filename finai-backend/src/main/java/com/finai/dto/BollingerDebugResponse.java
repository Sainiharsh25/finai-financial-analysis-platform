package com.finai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class BollingerDebugResponse {

    private LocalDate date;
    private BigDecimal closePrice;
    private BigDecimal middleBand;
    private BigDecimal upperBand;
    private BigDecimal lowerBand;
    private String signal;
}