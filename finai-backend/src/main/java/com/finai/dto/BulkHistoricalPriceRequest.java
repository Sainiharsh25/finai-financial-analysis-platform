package com.finai.dto;

import lombok.Data;

import java.util.List;

@Data
public class BulkHistoricalPriceRequest {

    private String symbol;
    private List<HistoricalPriceRequest> prices;
}