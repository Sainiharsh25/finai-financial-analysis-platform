package com.finai.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PortfolioHoldingRequest {

    @NotBlank
    private String symbol;

    @Min(1)
    private Integer quantity;

    @DecimalMin(value = "0.01")
    private BigDecimal averageBuyPrice;
}