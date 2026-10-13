package com.finai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class MACDResponse {

    private BigDecimal macd;
    private BigDecimal signal;
    private BigDecimal histogram;
}