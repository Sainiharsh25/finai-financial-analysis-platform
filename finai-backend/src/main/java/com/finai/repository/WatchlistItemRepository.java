package com.finai.repository;

import com.finai.entity.Stock;
import com.finai.entity.User;
import com.finai.entity.WatchlistItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WatchlistItemRepository
        extends JpaRepository<WatchlistItem, Long> {

    List<WatchlistItem> findByUserOrderByCreatedAtDesc(User user);

    Optional<WatchlistItem> findByUserAndStock(
            User user,
            Stock stock
    );

    boolean existsByUserAndStock(
            User user,
            Stock stock
    );
}