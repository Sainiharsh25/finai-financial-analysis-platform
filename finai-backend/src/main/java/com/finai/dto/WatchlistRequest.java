package com.finai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class WatchlistRequest {

    @NotBlank(message = "Stock symbol is required")
    private String symbol;
}