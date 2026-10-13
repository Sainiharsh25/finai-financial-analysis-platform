package com.finai.dto;

import lombok.Data;

@Data
public class StockRequest {

    private String symbol;
    private String companyName;
    private String exchange;
}