package com.finai.controller;

import com.finai.dto.PortfolioHoldingRequest;
import com.finai.dto.PortfolioHoldingResponse;
import com.finai.dto.PortfolioSummaryResponse;
import com.finai.service.PortfolioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;

    @PostMapping("/holdings")
    public ResponseEntity<PortfolioHoldingResponse> addHolding(
            @Valid @RequestBody PortfolioHoldingRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                portfolioService.addHolding(request, authentication)
        );
    }

    @GetMapping("/holdings")
    public ResponseEntity<List<PortfolioHoldingResponse>> getHoldings(
            Authentication authentication) {

        return ResponseEntity.ok(
                portfolioService.getHoldings(authentication)
        );
    }

    @DeleteMapping("/holdings/{symbol}")
    public ResponseEntity<String> deleteHolding(
            @PathVariable String symbol,
            Authentication authentication) {

        portfolioService.deleteHolding(symbol, authentication);

        return ResponseEntity.ok(
                "Holding deleted successfully"
        );
    }

    @GetMapping("/summary")
    public ResponseEntity<PortfolioSummaryResponse> getSummary(
            Authentication authentication) {

        return ResponseEntity.ok(
                portfolioService.getSummary(authentication)
        );
    }
}