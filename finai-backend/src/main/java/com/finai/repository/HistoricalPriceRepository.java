package com.finai.repository;

import com.finai.entity.HistoricalPrice;
import com.finai.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HistoricalPriceRepository
        extends JpaRepository<HistoricalPrice, Long> {
    Optional<HistoricalPrice> findTopByStockOrderByTradingDateDesc(Stock stock);

    List<HistoricalPrice> findByStockOrderByTradingDateAsc(
            Stock stock
    );

    List<HistoricalPrice> findByStockAndTradingDateBetweenOrderByTradingDateAsc(
            Stock stock,
            LocalDate startDate,
            LocalDate endDate
    );
    boolean existsByStockAndTradingDate(
            Stock stock,
            LocalDate tradingDate);
}