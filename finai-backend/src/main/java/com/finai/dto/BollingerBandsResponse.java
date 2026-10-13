package com.finai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class BollingerBandsResponse {

    private BigDecimal middleBand;
    private BigDecimal upperBand;
    private BigDecimal lowerBand;
}