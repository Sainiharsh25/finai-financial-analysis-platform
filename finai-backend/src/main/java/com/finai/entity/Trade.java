package com.finai.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "trades")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "backtest_id", nullable = false)
    private Backtest backtest;

    private LocalDate tradeDate;

    private String action;

    private BigDecimal price;

    private Integer quantity;

    private BigDecimal profitLoss;
}