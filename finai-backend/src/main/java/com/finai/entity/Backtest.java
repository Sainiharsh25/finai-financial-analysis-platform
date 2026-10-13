package com.finai.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "backtests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Backtest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "stock_id", nullable = false)
    private Stock stock;

    @ManyToOne
    @JoinColumn(name = "strategy_id", nullable = false)
    private Strategy strategy;

    private LocalDate startDate;
    private LocalDate endDate;

    private BigDecimal initialCapital;
    private BigDecimal finalCapital;

    private BigDecimal totalReturn;
    private BigDecimal winRate;

    private Integer totalTrades;
}