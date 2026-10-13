
package com.finai.service;

import com.finai.dto.PortfolioHoldingResponse;
import com.finai.entity.PortfolioSnapshot;
import com.finai.entity.User;
import com.finai.repository.PortfolioSnapshotRepository;
import com.finai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PortfolioSnapshotService {

    private final PortfolioSnapshotRepository snapshotRepository;
    private final PortfolioService portfolioService;
    private final UserRepository userRepository;

    @Transactional
    public PortfolioSnapshot saveTodaySnapshot(
            Authentication authentication) {

        User user = getCurrentUser(authentication);

        List<PortfolioHoldingResponse> holdings =
                portfolioService.getHoldings(authentication);

        BigDecimal portfolioValue = holdings.stream()
                .map(PortfolioHoldingResponse::getCurrentValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal investedValue = holdings.stream()
                .map(PortfolioHoldingResponse::getInvestedValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal profitLoss = portfolioValue.subtract(investedValue);
        LocalDate today = LocalDate.now();

        PortfolioSnapshot snapshot = snapshotRepository
                .findByUserAndSnapshotDate(user, today)
                .orElseGet(() -> new PortfolioSnapshot(
                        user,
                        today,
                        BigDecimal.ZERO,
                        BigDecimal.ZERO,
                        BigDecimal.ZERO
                ));

        snapshot.setPortfolioValue(portfolioValue);
        snapshot.setInvestedValue(investedValue);
        snapshot.setProfitLoss(profitLoss);

        return snapshotRepository.save(snapshot);
    }

    @Transactional(readOnly = true)
    public List<PortfolioSnapshot> getHistory(
            Authentication authentication,
            LocalDate startDate,
            LocalDate endDate) {

        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException(
                    "Start date and end date are required"
            );
        }

        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException(
                    "Start date cannot be after end date"
            );
        }

        User user = getCurrentUser(authentication);

        return snapshotRepository
                .findByUserAndSnapshotDateBetweenOrderBySnapshotDateAsc(
                        user,
                        startDate,
                        endDate
                );
    }

    private User getCurrentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
