package com.finai.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "portfolio_snapshots",
        indexes = {
                @Index(
                        name = "idx_snapshot_user_date",
                        columnList = "user_id, snapshot_date"
                )
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_snapshot_user_date",
                        columnNames = {"user_id", "snapshot_date"}
                )
        }
)
public class PortfolioSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "snapshot_date", nullable = false)
    private LocalDate snapshotDate;

    @Column(name = "portfolio_value", nullable = false, precision = 19, scale = 2)
    private BigDecimal portfolioValue;

    @Column(name = "invested_value", nullable = false, precision = 19, scale = 2)
    private BigDecimal investedValue;

    @Column(name = "profit_loss", nullable = false, precision = 19, scale = 2)
    private BigDecimal profitLoss;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    public PortfolioSnapshot() {
    }

    public PortfolioSnapshot(
            User user,
            LocalDate snapshotDate,
            BigDecimal portfolioValue,
            BigDecimal investedValue,
            BigDecimal profitLoss) {
        this.user = user;
        this.snapshotDate = snapshotDate;
        this.portfolioValue = portfolioValue;
        this.investedValue = investedValue;
        this.profitLoss = profitLoss;
        this.recordedAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (recordedAt == null) {
            recordedAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDate getSnapshotDate() {
        return snapshotDate;
    }

    public void setSnapshotDate(LocalDate snapshotDate) {
        this.snapshotDate = snapshotDate;
    }

    public BigDecimal getPortfolioValue() {
        return portfolioValue;
    }

    public void setPortfolioValue(BigDecimal portfolioValue) {
        this.portfolioValue = portfolioValue;
    }

    public BigDecimal getInvestedValue() {
        return investedValue;
    }

    public void setInvestedValue(BigDecimal investedValue) {
        this.investedValue = investedValue;
    }

    public BigDecimal getProfitLoss() {
        return profitLoss;
    }

    public void setProfitLoss(BigDecimal profitLoss) {
        this.profitLoss = profitLoss;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }
}
