package com.finai.repository;

import com.finai.entity.PortfolioSnapshot;
import com.finai.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PortfolioSnapshotRepository
        extends JpaRepository<PortfolioSnapshot, Long> {

    List<PortfolioSnapshot> findByUserAndSnapshotDateBetweenOrderBySnapshotDateAsc(
            User user,
            LocalDate startDate,
            LocalDate endDate
    );

    Optional<PortfolioSnapshot> findByUserAndSnapshotDate(
            User user,
            LocalDate snapshotDate
    );
}
