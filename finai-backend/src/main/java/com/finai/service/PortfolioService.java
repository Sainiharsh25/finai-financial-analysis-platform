package com.finai.service;

import com.finai.dto.PortfolioHoldingRequest;
import com.finai.dto.PortfolioHoldingResponse;
import com.finai.dto.PortfolioSummaryResponse;
import com.finai.entity.PortfolioHolding;
import com.finai.entity.Stock;
import com.finai.entity.User;
import com.finai.repository.HistoricalPriceRepository;
import com.finai.repository.PortfolioHoldingRepository;
import com.finai.repository.StockRepository;
import com.finai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PortfolioService {

    private final PortfolioHoldingRepository portfolioHoldingRepository;
    private final StockRepository stockRepository;
    private final UserRepository userRepository;
    private final HistoricalPriceRepository historicalPriceRepository;

    @Transactional
    public PortfolioHoldingResponse addHolding(
            PortfolioHoldingRequest request,
            Authentication authentication) {

        User user = getCurrentUser(authentication);

        String symbol = request.getSymbol().trim().toUpperCase();

        Stock stock = stockRepository.findBySymbol(symbol)
                .orElseGet(() -> stockRepository.save(
                        Stock.builder()
                                .symbol(symbol)
                                .companyName(symbol)
                                .exchange("NSE")
                                .build()
                ));

        PortfolioHolding holding =
                portfolioHoldingRepository.findByUserAndStock(user, stock)
                        .orElse(null);

        if (holding == null) {
            holding = PortfolioHolding.builder()
                    .user(user)
                    .stock(stock)
                    .quantity(request.getQuantity())
                    .averageBuyPrice(request.getAverageBuyPrice())
                    .build();
        } else {
            int oldQuantity = holding.getQuantity();
            int newQuantity = request.getQuantity();

            BigDecimal oldValue = holding.getAverageBuyPrice()
                    .multiply(BigDecimal.valueOf(oldQuantity));

            BigDecimal newValue = request.getAverageBuyPrice()
                    .multiply(BigDecimal.valueOf(newQuantity));

            int totalQuantity = oldQuantity + newQuantity;

            BigDecimal newAveragePrice = oldValue.add(newValue)
                    .divide(
                            BigDecimal.valueOf(totalQuantity),
                            2,
                            RoundingMode.HALF_UP
                    );

            holding.setQuantity(totalQuantity);
            holding.setAverageBuyPrice(newAveragePrice);
        }

        PortfolioHolding savedHolding =
                portfolioHoldingRepository.save(holding);

        return buildResponse(savedHolding);
    }

    @Transactional(readOnly = true)
    public List<PortfolioHoldingResponse> getHoldings(
            Authentication authentication) {

        User user = getCurrentUser(authentication);

        return portfolioHoldingRepository.findByUser(user)
                .stream()
                .map(this::buildResponse)
                .toList();
    }

    @Transactional
    public void deleteHolding(
            String symbol,
            Authentication authentication) {

        User user = getCurrentUser(authentication);

        String normalizedSymbol = symbol.trim().toUpperCase();

        Stock stock = stockRepository.findBySymbol(normalizedSymbol)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Stock not found: " + normalizedSymbol));

        PortfolioHolding holding =
                portfolioHoldingRepository.findByUserAndStock(user, stock)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Holding not found: " + normalizedSymbol));

        portfolioHoldingRepository.delete(holding);
    }

    private User getCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("User is not authenticated");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
    }

    private PortfolioHoldingResponse buildResponse(
            PortfolioHolding holding) {

        Stock stock = holding.getStock();

        BigDecimal currentPrice = historicalPriceRepository
                .findTopByStockOrderByTradingDateDesc(stock)
                .map(price -> price.getClosePrice())
                .orElse(null);

        BigDecimal investedValue = holding.getAverageBuyPrice()
                .multiply(BigDecimal.valueOf(holding.getQuantity()));

        // Missing market data is unavailable, not a zero price.
        BigDecimal currentValue = currentPrice == null
                ? null
                : currentPrice.multiply(
                BigDecimal.valueOf(holding.getQuantity()));

        BigDecimal profitLoss = currentValue == null
                ? null
                : currentValue.subtract(investedValue);

        BigDecimal returnPercent = null;

        if (profitLoss != null) {
            if (investedValue.compareTo(BigDecimal.ZERO) > 0) {
                returnPercent = profitLoss
                        .divide(investedValue, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .setScale(2, RoundingMode.HALF_UP);
            } else {
                returnPercent = BigDecimal.ZERO;
            }
        }

        return new PortfolioHoldingResponse(
                stock.getSymbol(),
                stock.getCompanyName(),
                holding.getQuantity(),
                holding.getAverageBuyPrice(),
                currentPrice,
                investedValue,
                currentValue,
                profitLoss,
                returnPercent
        );
    }

    @Transactional(readOnly = true)
    public PortfolioSummaryResponse getSummary(
            Authentication authentication) {

        User user = getCurrentUser(authentication);

        List<PortfolioHoldingResponse> holdings =
                portfolioHoldingRepository.findByUser(user)
                        .stream()
                        .map(this::buildResponse)
                        .toList();

        boolean pricesAvailable = holdings.stream()
                .allMatch(h -> h.getCurrentValue() != null);

        BigDecimal totalValue = pricesAvailable
                ? holdings.stream()
                .map(PortfolioHoldingResponse::getCurrentValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                : null;

        BigDecimal investedValue = holdings.stream()
                .map(PortfolioHoldingResponse::getInvestedValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalProfitLoss = totalValue == null
                ? null
                : totalValue.subtract(investedValue);

        BigDecimal totalReturn = null;

        if (totalProfitLoss != null) {
            if (investedValue.compareTo(BigDecimal.ZERO) > 0) {
                totalReturn = totalProfitLoss
                        .divide(investedValue, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .setScale(2, RoundingMode.HALF_UP);
            } else {
                totalReturn = BigDecimal.ZERO;
            }
        }

        return new PortfolioSummaryResponse(
                totalValue,
                investedValue,
                totalProfitLoss,
                totalReturn,
                holdings.size()
        );
    }
}
