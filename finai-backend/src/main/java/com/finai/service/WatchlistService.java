package com.finai.service;

import com.finai.dto.WatchlistRequest;
import com.finai.dto.WatchlistResponse;
import com.finai.entity.HistoricalPrice;
import com.finai.entity.Stock;
import com.finai.entity.User;
import com.finai.entity.WatchlistItem;
import com.finai.repository.HistoricalPriceRepository;
import com.finai.repository.StockRepository;
import com.finai.repository.UserRepository;
import com.finai.repository.WatchlistItemRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WatchlistService {

    private final WatchlistItemRepository watchlistItemRepository;
    private final StockRepository stockRepository;
    private final UserRepository userRepository;
    private final HistoricalPriceRepository historicalPriceRepository;

    @Transactional
    public WatchlistResponse addStock(
            WatchlistRequest request,
            Authentication authentication) {

        User user = getCurrentUser(authentication);

        String symbol = request.getSymbol().trim().toUpperCase();

        Stock stock = stockRepository.findBySymbol(symbol)
                .orElseThrow(() ->
                        new RuntimeException("Stock not found: " + symbol));

        boolean alreadyExists =
                watchlistItemRepository.existsByUserAndStock(user, stock);

        if (alreadyExists) {
            throw new RuntimeException(
                    symbol + " is already in your watchlist");
        }

        WatchlistItem item = WatchlistItem.builder()
                .user(user)
                .stock(stock)
                .createdAt(java.time.LocalDateTime.now())
                .build();

        watchlistItemRepository.save(item);

        return buildResponse(item);
    }

    public List<WatchlistResponse> getWatchlist(
            Authentication authentication) {

        User user = getCurrentUser(authentication);

        return watchlistItemRepository
                .findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::buildResponse)
                .toList();
    }

    @Transactional
    public void removeStock(
            String symbol,
            Authentication authentication) {

        User user = getCurrentUser(authentication);

        String normalizedSymbol = symbol.trim().toUpperCase();

        Stock stock = stockRepository.findBySymbol(normalizedSymbol)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Stock not found: " + normalizedSymbol));

        WatchlistItem item = watchlistItemRepository
                .findByUserAndStock(user, stock)
                .orElseThrow(() ->
                        new RuntimeException(
                                normalizedSymbol + " is not in your watchlist"));

        watchlistItemRepository.delete(item);
    }

    private User getCurrentUser(Authentication authentication) {

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
    }

    private WatchlistResponse buildResponse(WatchlistItem item) {

        Stock stock = item.getStock();

        List<HistoricalPrice> prices =
                historicalPriceRepository
                        .findByStockOrderByTradingDateAsc(stock);

        BigDecimal currentPrice = BigDecimal.ZERO;
        BigDecimal previousClose = BigDecimal.ZERO;
        BigDecimal priceChange = BigDecimal.ZERO;
        BigDecimal changePercent = BigDecimal.ZERO;

        if (!prices.isEmpty()) {
            currentPrice = prices.get(prices.size() - 1).getClosePrice();

            if (prices.size() >= 2) {
                previousClose =
                        prices.get(prices.size() - 2).getClosePrice();

                priceChange = currentPrice.subtract(previousClose);

                if (previousClose.compareTo(BigDecimal.ZERO) > 0) {
                    changePercent = priceChange
                            .divide(previousClose, 6, RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100))
                            .setScale(2, RoundingMode.HALF_UP);
                }
            } else {
                previousClose = currentPrice;
            }
        }

        return new WatchlistResponse(
                stock.getSymbol(),
                stock.getCompanyName(),
                stock.getExchange(),
                currentPrice,
                previousClose,
                priceChange,
                changePercent,
                item.getCreatedAt()
        );
    }
}