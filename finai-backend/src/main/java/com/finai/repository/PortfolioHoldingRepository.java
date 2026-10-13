package com.finai.repository;

import com.finai.entity.PortfolioHolding;
import com.finai.entity.User;
import com.finai.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PortfolioHoldingRepository
        extends JpaRepository<PortfolioHolding, Long> {

    List<PortfolioHolding> findByUser(User user);

    Optional<PortfolioHolding> findByUserAndStock(User user, Stock stock);

    void deleteByUserAndStock(User user, Stock stock);
}