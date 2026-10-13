package com.finai.controller;

import com.finai.dto.WatchlistRequest;
import com.finai.dto.WatchlistResponse;
import com.finai.service.WatchlistService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/watchlist")
@RequiredArgsConstructor
public class WatchlistController {

    private final WatchlistService watchlistService;

    // Add a stock to the watchlist
    @PostMapping
    public ResponseEntity<WatchlistResponse> addStock(
            @Valid @RequestBody WatchlistRequest request,
            Authentication authentication) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(watchlistService.addStock(request, authentication));
    }

    // Get the logged-in user's watchlist
    @GetMapping
    public ResponseEntity<List<WatchlistResponse>> getWatchlist(
            Authentication authentication) {

        return ResponseEntity.ok(
                watchlistService.getWatchlist(authentication));
    }

    // Remove a stock from the watchlist
    @DeleteMapping("/{symbol}")
    public ResponseEntity<Map<String, String>> removeStock(
            @PathVariable String symbol,
            Authentication authentication) {

        watchlistService.removeStock(symbol, authentication);

        return ResponseEntity.ok(
                Map.of("message", symbol.toUpperCase()
                        + " removed from watchlist successfully"));
    }
}