package com.finai.service;

import com.finai.dto.BacktestResponse;
import com.finai.dto.BacktestTradeResponse;
import com.finai.entity.HistoricalPrice;
import com.finai.entity.Stock;
import com.finai.repository.HistoricalPriceRepository;
import com.finai.repository.StockRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class BacktestService {

    private final HistoricalPriceRepository historicalPriceRepository;
    private final StockRepository stockRepository;
    private final TechnicalIndicatorService technicalIndicatorService;

    private static final BigDecimal POSITION_PERCENTAGE =
            BigDecimal.valueOf(0.10);

    public BacktestService(
            HistoricalPriceRepository historicalPriceRepository,
            StockRepository stockRepository,
            TechnicalIndicatorService technicalIndicatorService) {

        this.historicalPriceRepository = historicalPriceRepository;
        this.stockRepository = stockRepository;
        this.technicalIndicatorService = technicalIndicatorService;
    }

    // =========================================================
    // RSI BACKTEST
    // =========================================================

    public BacktestResponse backtestRSI(
            String symbol,
            LocalDate startDate,
            LocalDate endDate,
            BigDecimal initialCapital) {

        Stock stock = getStock(symbol);

        List<HistoricalPrice> prices =
                historicalPriceRepository
                        .findByStockAndTradingDateBetweenOrderByTradingDateAsc(
                                stock,
                                startDate,
                                endDate
                        );

        if (prices.size() < 15) {
            throw new RuntimeException(
                    "Not enough historical data for RSI backtesting"
            );
        }

        BigDecimal capital = initialCapital;

        boolean holding = false;

        BigDecimal entryValue = BigDecimal.ZERO;

        int quantity = 0;

        int totalTrades = 0;
        int winningTrades = 0;

        BigDecimal grossProfit = BigDecimal.ZERO;
        BigDecimal grossLoss = BigDecimal.ZERO;

        BigDecimal peakEquity = initialCapital;
        BigDecimal maxDrawdown = BigDecimal.ZERO;

        List<BacktestTradeResponse> tradeHistory =
                new ArrayList<>();

        for (int i = 14; i < prices.size(); i++) {

            BigDecimal rsi =
                    calculateHistoricalRSI(
                            prices,
                            i,
                            14
                    );

            if (rsi == null) {
                continue;
            }

            BigDecimal currentPrice =
                    prices.get(i).getClosePrice();

            LocalDate currentDate =
                    prices.get(i).getTradingDate();

            // =============================================
            // BUY
            // RSI <= 30
            // =============================================

            if (!holding
                    && rsi.compareTo(
                    BigDecimal.valueOf(30)) <= 0) {

                BigDecimal positionValue =
                        capital.multiply(
                                POSITION_PERCENTAGE
                        );

                quantity =
                        positionValue
                                .divide(
                                        currentPrice,
                                        0,
                                        RoundingMode.DOWN
                                )
                                .intValue();

                if (quantity > 0) {

                    entryValue =
                            currentPrice.multiply(
                                    BigDecimal.valueOf(quantity)
                            );

                    capital =
                            capital.subtract(entryValue);

                    holding = true;

                    tradeHistory.add(
                            new BacktestTradeResponse(
                                    currentDate,
                                    "BUY",
                                    currentPrice,
                                    quantity,
                                    BigDecimal.ZERO
                            )
                    );
                }
            }

            // =============================================
            // SELL
            // RSI >= 70
            // =============================================

            else if (holding
                    && rsi.compareTo(
                    BigDecimal.valueOf(70)) >= 0) {

                BigDecimal exitValue =
                        currentPrice.multiply(
                                BigDecimal.valueOf(quantity)
                        );

                BigDecimal profitLoss =
                        exitValue.subtract(entryValue);

                capital =
                        capital.add(exitValue);

                totalTrades++;

                if (profitLoss.compareTo(
                        BigDecimal.ZERO) > 0) {

                    winningTrades++;

                    grossProfit =
                            grossProfit.add(profitLoss);

                } else {

                    grossLoss =
                            grossLoss.add(
                                    profitLoss.abs()
                            );
                }

                tradeHistory.add(
                        new BacktestTradeResponse(
                                currentDate,
                                "SELL",
                                currentPrice,
                                quantity,
                                profitLoss
                        )
                );

                holding = false;
                quantity = 0;
                entryValue = BigDecimal.ZERO;
            }

            // =============================================
            // EQUITY + DRAWDOWN
            // =============================================

            BigDecimal equity =
                    calculateEquity(
                            capital,
                            holding,
                            currentPrice,
                            quantity
                    );

            if (equity.compareTo(peakEquity) > 0) {
                peakEquity = equity;
            }

            BigDecimal drawdown =
                    calculateDrawdown(
                            equity,
                            peakEquity
                    );

            if (drawdown.compareTo(maxDrawdown) > 0) {
                maxDrawdown = drawdown;
            }
        }

        // =============================================
        // CLOSE OPEN POSITION AT END
        // =============================================

        if (holding && !prices.isEmpty()) {

            HistoricalPrice lastPrice =
                    prices.get(prices.size() - 1);

            BigDecimal exitValue =
                    lastPrice.getClosePrice()
                            .multiply(
                                    BigDecimal.valueOf(quantity)
                            );

            BigDecimal profitLoss =
                    exitValue.subtract(entryValue);

            capital =
                    capital.add(exitValue);

            totalTrades++;

            if (profitLoss.compareTo(
                    BigDecimal.ZERO) > 0) {

                winningTrades++;

                grossProfit =
                        grossProfit.add(profitLoss);

            } else {

                grossLoss =
                        grossLoss.add(
                                profitLoss.abs()
                        );
            }

            tradeHistory.add(
                    new BacktestTradeResponse(
                            lastPrice.getTradingDate(),
                            "SELL",
                            lastPrice.getClosePrice(),
                            quantity,
                            profitLoss
                    )
            );

            holding = false;
            quantity = 0;
            entryValue = BigDecimal.ZERO;
        }

        return buildResponse(
                symbol,
                "RSI Strategy",
                initialCapital,
                capital,
                totalTrades,
                winningTrades,
                grossProfit,
                grossLoss,
                maxDrawdown,
                tradeHistory
        );
    }


    // =========================================================
    // EMA CROSSOVER BACKTEST
    // =========================================================

    public BacktestResponse backtestEMACrossover(
            String symbol,
            LocalDate startDate,
            LocalDate endDate,
            BigDecimal initialCapital) {

        Stock stock = getStock(symbol);

        List<HistoricalPrice> prices =
                historicalPriceRepository
                        .findByStockAndTradingDateBetweenOrderByTradingDateAsc(
                                stock,
                                startDate,
                                endDate
                        );

        if (prices.size() < 51) {
            throw new RuntimeException(
                    "Not enough historical data for EMA backtesting"
            );
        }

        BigDecimal capital = initialCapital;

        boolean holding = false;

        BigDecimal entryValue = BigDecimal.ZERO;

        int quantity = 0;

        int totalTrades = 0;
        int winningTrades = 0;

        BigDecimal grossProfit = BigDecimal.ZERO;
        BigDecimal grossLoss = BigDecimal.ZERO;

        BigDecimal peakEquity = initialCapital;
        BigDecimal maxDrawdown = BigDecimal.ZERO;

        List<BacktestTradeResponse> tradeHistory =
                new ArrayList<>();

        for (int i = 50; i < prices.size(); i++) {

            BigDecimal ema20 =
                    calculateHistoricalEMA(
                            prices,
                            i,
                            20
                    );

            BigDecimal ema50 =
                    calculateHistoricalEMA(
                            prices,
                            i,
                            50
                    );

            if (ema20 == null || ema50 == null) {
                continue;
            }

            BigDecimal currentPrice =
                    prices.get(i).getClosePrice();

            LocalDate currentDate =
                    prices.get(i).getTradingDate();

            // =============================================
            // BUY
            // EMA20 > EMA50
            // =============================================

            if (!holding
                    && ema20.compareTo(ema50) > 0) {

                BigDecimal positionValue =
                        capital.multiply(
                                POSITION_PERCENTAGE
                        );

                quantity =
                        positionValue
                                .divide(
                                        currentPrice,
                                        0,
                                        RoundingMode.DOWN
                                )
                                .intValue();

                if (quantity > 0) {

                    entryValue =
                            currentPrice.multiply(
                                    BigDecimal.valueOf(quantity)
                            );

                    capital =
                            capital.subtract(entryValue);

                    holding = true;

                    tradeHistory.add(
                            new BacktestTradeResponse(
                                    currentDate,
                                    "BUY",
                                    currentPrice,
                                    quantity,
                                    BigDecimal.ZERO
                            )
                    );
                }
            }

            // =============================================
            // SELL
            // EMA20 < EMA50
            // =============================================

            else if (holding
                    && ema20.compareTo(ema50) < 0) {

                BigDecimal exitValue =
                        currentPrice.multiply(
                                BigDecimal.valueOf(quantity)
                        );

                BigDecimal profitLoss =
                        exitValue.subtract(entryValue);

                capital =
                        capital.add(exitValue);

                totalTrades++;

                if (profitLoss.compareTo(
                        BigDecimal.ZERO) > 0) {

                    winningTrades++;

                    grossProfit =
                            grossProfit.add(profitLoss);

                } else {

                    grossLoss =
                            grossLoss.add(
                                    profitLoss.abs()
                            );
                }

                tradeHistory.add(
                        new BacktestTradeResponse(
                                currentDate,
                                "SELL",
                                currentPrice,
                                quantity,
                                profitLoss
                        )
                );

                holding = false;
                quantity = 0;
                entryValue = BigDecimal.ZERO;
            }

            // =============================================
            // EQUITY + DRAWDOWN
            // =============================================

            BigDecimal equity =
                    calculateEquity(
                            capital,
                            holding,
                            currentPrice,
                            quantity
                    );

            if (equity.compareTo(peakEquity) > 0) {
                peakEquity = equity;
            }

            BigDecimal drawdown =
                    calculateDrawdown(
                            equity,
                            peakEquity
                    );

            if (drawdown.compareTo(maxDrawdown) > 0) {
                maxDrawdown = drawdown;
            }
        }

        // =============================================
        // CLOSE OPEN POSITION AT END
        // =============================================

        if (holding && !prices.isEmpty()) {

            HistoricalPrice lastPrice =
                    prices.get(prices.size() - 1);

            BigDecimal exitValue =
                    lastPrice.getClosePrice()
                            .multiply(
                                    BigDecimal.valueOf(quantity)
                            );

            BigDecimal profitLoss =
                    exitValue.subtract(entryValue);

            capital =
                    capital.add(exitValue);

            totalTrades++;

            if (profitLoss.compareTo(
                    BigDecimal.ZERO) > 0) {

                winningTrades++;

                grossProfit =
                        grossProfit.add(profitLoss);

            } else {

                grossLoss =
                        grossLoss.add(
                                profitLoss.abs()
                        );
            }

            tradeHistory.add(
                    new BacktestTradeResponse(
                            lastPrice.getTradingDate(),
                            "SELL",
                            lastPrice.getClosePrice(),
                            quantity,
                            profitLoss
                    )
            );

            holding = false;
            quantity = 0;
            entryValue = BigDecimal.ZERO;
        }

        return buildResponse(
                symbol,
                "EMA Crossover Strategy",
                initialCapital,
                capital,
                totalTrades,
                winningTrades,
                grossProfit,
                grossLoss,
                maxDrawdown,
                tradeHistory
        );
    }


    // =========================================================
    // MACD CROSSOVER BACKTEST
    // =========================================================

    public BacktestResponse backtestMACD(
            String symbol,
            LocalDate startDate,
            LocalDate endDate,
            BigDecimal initialCapital) {

        Stock stock = getStock(symbol);

        List<HistoricalPrice> prices =
                historicalPriceRepository
                        .findByStockAndTradingDateBetweenOrderByTradingDateAsc(
                                stock,
                                startDate,
                                endDate
                        );

        if (prices.size() < 35) {
            throw new RuntimeException(
                    "Not enough historical data for MACD backtesting"
            );
        }

        BigDecimal capital = initialCapital;

        boolean holding = false;

        BigDecimal entryValue = BigDecimal.ZERO;

        int quantity = 0;

        int totalTrades = 0;
        int winningTrades = 0;

        BigDecimal grossProfit = BigDecimal.ZERO;
        BigDecimal grossLoss = BigDecimal.ZERO;

        BigDecimal peakEquity = initialCapital;
        BigDecimal maxDrawdown = BigDecimal.ZERO;

        List<BacktestTradeResponse> tradeHistory =
                new ArrayList<>();

        /*
         * MACD uses:
         *
         * EMA 12
         * EMA 26
         * Signal Line = 9-period EMA of MACD
         *
         * We don't process the final candle for a NEW entry.
         * If a position is already open, it is closed at the
         * final candle below.
         */
        for (int i = 34; i < prices.size() - 1; i++) {

            BigDecimal currentMacd =
                    calculateHistoricalMACD(
                            prices,
                            i
                    );

            BigDecimal currentSignal =
                    calculateHistoricalMACDSignal(
                            prices,
                            i,
                            9
                    );

            BigDecimal previousMacd =
                    calculateHistoricalMACD(
                            prices,
                            i - 1
                    );

            BigDecimal previousSignal =
                    calculateHistoricalMACDSignal(
                            prices,
                            i - 1,
                            9
                    );

            if (currentMacd == null
                    || currentSignal == null
                    || previousMacd == null
                    || previousSignal == null) {
                continue;
            }

            BigDecimal currentPrice =
                    prices.get(i).getClosePrice();

            LocalDate currentDate =
                    prices.get(i).getTradingDate();

            // =============================================
            // BULLISH CROSSOVER
            // MACD crosses ABOVE Signal Line
            // =============================================

            boolean bullishCrossover =
                    previousMacd.compareTo(previousSignal) <= 0
                            && currentMacd.compareTo(currentSignal) > 0;

            // =============================================
            // BEARISH CROSSOVER
            // MACD crosses BELOW Signal Line
            // =============================================

            boolean bearishCrossover =
                    previousMacd.compareTo(previousSignal) >= 0
                            && currentMacd.compareTo(currentSignal) < 0;

            // =============================================
            // BUY
            // =============================================

            if (!holding && bullishCrossover) {

                BigDecimal positionValue =
                        capital.multiply(
                                POSITION_PERCENTAGE
                        );

                quantity =
                        positionValue
                                .divide(
                                        currentPrice,
                                        0,
                                        RoundingMode.DOWN
                                )
                                .intValue();

                if (quantity > 0) {

                    entryValue =
                            currentPrice.multiply(
                                    BigDecimal.valueOf(quantity)
                            );

                    capital =
                            capital.subtract(entryValue);

                    holding = true;

                    tradeHistory.add(
                            new BacktestTradeResponse(
                                    currentDate,
                                    "BUY",
                                    currentPrice,
                                    quantity,
                                    BigDecimal.ZERO
                            )
                    );
                }
            }

            // =============================================
            // SELL
            // =============================================

            else if (holding && bearishCrossover) {

                BigDecimal exitValue =
                        currentPrice.multiply(
                                BigDecimal.valueOf(quantity)
                        );

                BigDecimal profitLoss =
                        exitValue.subtract(entryValue);

                capital =
                        capital.add(exitValue);

                totalTrades++;

                if (profitLoss.compareTo(
                        BigDecimal.ZERO) > 0) {

                    winningTrades++;

                    grossProfit =
                            grossProfit.add(profitLoss);

                } else {

                    grossLoss =
                            grossLoss.add(
                                    profitLoss.abs()
                            );
                }

                tradeHistory.add(
                        new BacktestTradeResponse(
                                currentDate,
                                "SELL",
                                currentPrice,
                                quantity,
                                profitLoss
                        )
                );

                holding = false;
                quantity = 0;
                entryValue = BigDecimal.ZERO;
            }

            // =============================================
            // EQUITY + DRAWDOWN
            // =============================================

            BigDecimal equity =
                    calculateEquity(
                            capital,
                            holding,
                            currentPrice,
                            quantity
                    );

            if (equity.compareTo(peakEquity) > 0) {
                peakEquity = equity;
            }

            BigDecimal drawdown =
                    calculateDrawdown(
                            equity,
                            peakEquity
                    );

            if (drawdown.compareTo(maxDrawdown) > 0) {
                maxDrawdown = drawdown;
            }
        }

        // =============================================
        // CLOSE OPEN POSITION AT END
        // =============================================

        if (holding && !prices.isEmpty()) {

            HistoricalPrice lastPrice =
                    prices.get(prices.size() - 1);

            BigDecimal exitValue =
                    lastPrice.getClosePrice()
                            .multiply(
                                    BigDecimal.valueOf(quantity)
                            );

            BigDecimal profitLoss =
                    exitValue.subtract(entryValue);

            capital =
                    capital.add(exitValue);

            totalTrades++;

            if (profitLoss.compareTo(
                    BigDecimal.ZERO) > 0) {

                winningTrades++;

                grossProfit =
                        grossProfit.add(profitLoss);

            } else {

                grossLoss =
                        grossLoss.add(
                                profitLoss.abs()
                        );
            }

            tradeHistory.add(
                    new BacktestTradeResponse(
                            lastPrice.getTradingDate(),
                            "SELL",
                            lastPrice.getClosePrice(),
                            quantity,
                            profitLoss
                    )
            );

            holding = false;
            quantity = 0;
            entryValue = BigDecimal.ZERO;
        }

        return buildResponse(
                symbol,
                "MACD Crossover Strategy",
                initialCapital,
                capital,
                totalTrades,
                winningTrades,
                grossProfit,
                grossLoss,
                maxDrawdown,
                tradeHistory
        );
    }


    // =========================================================
    // BOLLINGER BANDS BACKTEST
    // =========================================================

    public BacktestResponse backtestBollinger(
            String symbol,
            LocalDate startDate,
            LocalDate endDate,
            BigDecimal initialCapital) {

        Stock stock = getStock(symbol);

        List<HistoricalPrice> prices =
                historicalPriceRepository
                        .findByStockAndTradingDateBetweenOrderByTradingDateAsc(
                                stock,
                                startDate,
                                endDate
                        );

        if (prices.size() < 21) {
            throw new RuntimeException(
                    "Not enough historical data for Bollinger backtesting"
            );
        }

        BigDecimal capital = initialCapital;

        boolean holding = false;

        BigDecimal entryValue = BigDecimal.ZERO;

        int quantity = 0;

        int totalTrades = 0;
        int winningTrades = 0;

        BigDecimal grossProfit = BigDecimal.ZERO;
        BigDecimal grossLoss = BigDecimal.ZERO;

        BigDecimal peakEquity = initialCapital;
        BigDecimal maxDrawdown = BigDecimal.ZERO;

        List<BacktestTradeResponse> tradeHistory =
                new ArrayList<>();

        for (int i = 0; i < prices.size(); i++) {

            BollingerValues bands =
                    calculateHistoricalBollinger(
                            prices,
                            i,
                            20
                    );

            if (bands == null) {
                continue;
            }

            BigDecimal currentPrice =
                    prices.get(i).getClosePrice();

            LocalDate currentDate =
                    prices.get(i).getTradingDate();

            // =============================================
            // BUY
            // Price <= Lower Band
            // =============================================

            if (!holding
                    && currentPrice.compareTo(
                    bands.lowerBand) <= 0) {

                BigDecimal positionValue =
                        capital.multiply(
                                POSITION_PERCENTAGE
                        );

                quantity =
                        positionValue
                                .divide(
                                        currentPrice,
                                        0,
                                        RoundingMode.DOWN
                                )
                                .intValue();

                if (quantity > 0) {

                    entryValue =
                            currentPrice.multiply(
                                    BigDecimal.valueOf(quantity)
                            );

                    capital =
                            capital.subtract(entryValue);

                    holding = true;

                    tradeHistory.add(
                            new BacktestTradeResponse(
                                    currentDate,
                                    "BUY",
                                    currentPrice,
                                    quantity,
                                    BigDecimal.ZERO
                            )
                    );
                }
            }

            // =============================================
            // SELL
            // Price >= Upper Band
            // =============================================

            else if (holding
                    && currentPrice.compareTo(
                    bands.upperBand) >= 0) {

                BigDecimal exitValue =
                        currentPrice.multiply(
                                BigDecimal.valueOf(quantity)
                        );

                BigDecimal profitLoss =
                        exitValue.subtract(entryValue);

                capital =
                        capital.add(exitValue);

                totalTrades++;

                if (profitLoss.compareTo(
                        BigDecimal.ZERO) > 0) {

                    winningTrades++;

                    grossProfit =
                            grossProfit.add(profitLoss);

                } else {

                    grossLoss =
                            grossLoss.add(
                                    profitLoss.abs()
                            );
                }

                tradeHistory.add(
                        new BacktestTradeResponse(
                                currentDate,
                                "SELL",
                                currentPrice,
                                quantity,
                                profitLoss
                        )
                );

                holding = false;
                quantity = 0;
                entryValue = BigDecimal.ZERO;
            }

            // =============================================
            // EQUITY + DRAWDOWN
            // =============================================

            BigDecimal equity =
                    calculateEquity(
                            capital,
                            holding,
                            currentPrice,
                            quantity
                    );

            if (equity.compareTo(peakEquity) > 0) {
                peakEquity = equity;
            }

            BigDecimal drawdown =
                    calculateDrawdown(
                            equity,
                            peakEquity
                    );

            if (drawdown.compareTo(maxDrawdown) > 0) {
                maxDrawdown = drawdown;
            }
        }

        // =============================================
        // CLOSE OPEN POSITION AT END
        // =============================================

        if (holding && !prices.isEmpty()) {

            HistoricalPrice lastPrice =
                    prices.get(prices.size() - 1);

            BigDecimal exitValue =
                    lastPrice.getClosePrice()
                            .multiply(
                                    BigDecimal.valueOf(quantity)
                            );

            BigDecimal profitLoss =
                    exitValue.subtract(entryValue);

            capital =
                    capital.add(exitValue);

            totalTrades++;

            if (profitLoss.compareTo(
                    BigDecimal.ZERO) > 0) {

                winningTrades++;

                grossProfit =
                        grossProfit.add(profitLoss);

            } else {

                grossLoss =
                        grossLoss.add(
                                profitLoss.abs()
                        );
            }

            tradeHistory.add(
                    new BacktestTradeResponse(
                            lastPrice.getTradingDate(),
                            "SELL",
                            lastPrice.getClosePrice(),
                            quantity,
                            profitLoss
                    )
            );

            holding = false;
            quantity = 0;
            entryValue = BigDecimal.ZERO;
        }

        return buildResponse(
                symbol,
                "Bollinger Bands Strategy",
                initialCapital,
                capital,
                totalTrades,
                winningTrades,
                grossProfit,
                grossLoss,
                maxDrawdown,
                tradeHistory
        );
    }


    // =========================================================
    // HISTORICAL RSI
    // =========================================================

    private BigDecimal calculateHistoricalRSI(
            List<HistoricalPrice> prices,
            int index,
            int period) {

        if (index < period) {
            return null;
        }

        BigDecimal gain = BigDecimal.ZERO;
        BigDecimal loss = BigDecimal.ZERO;

        for (int i = index - period + 1;
             i <= index;
             i++) {

            BigDecimal current =
                    prices.get(i).getClosePrice();

            BigDecimal previous =
                    prices.get(i - 1).getClosePrice();

            BigDecimal difference =
                    current.subtract(previous);

            if (difference.compareTo(
                    BigDecimal.ZERO) > 0) {

                gain = gain.add(difference);

            } else {

                loss = loss.add(
                        difference.abs()
                );
            }
        }

        BigDecimal averageGain =
                gain.divide(
                        BigDecimal.valueOf(period),
                        8,
                        RoundingMode.HALF_UP
                );

        BigDecimal averageLoss =
                loss.divide(
                        BigDecimal.valueOf(period),
                        8,
                        RoundingMode.HALF_UP
                );

        if (averageLoss.compareTo(
                BigDecimal.ZERO) == 0) {

            return BigDecimal.valueOf(100);
        }

        BigDecimal rs =
                averageGain.divide(
                        averageLoss,
                        8,
                        RoundingMode.HALF_UP
                );

        return BigDecimal.valueOf(100)
                .subtract(
                        BigDecimal.valueOf(100)
                                .divide(
                                        BigDecimal.ONE.add(rs),
                                        8,
                                        RoundingMode.HALF_UP
                                )
                );
    }


    // =========================================================
    // HISTORICAL EMA
    // =========================================================

    private BigDecimal calculateHistoricalEMA(
            List<HistoricalPrice> prices,
            int index,
            int period) {

        if (index < period - 1) {
            return null;
        }

        BigDecimal sum = BigDecimal.ZERO;

        for (int i = index - period + 1;
             i <= index;
             i++) {

            sum = sum.add(
                    prices.get(i).getClosePrice()
            );
        }

        BigDecimal ema =
                sum.divide(
                        BigDecimal.valueOf(period),
                        8,
                        RoundingMode.HALF_UP
                );

        BigDecimal multiplier =
                BigDecimal.valueOf(2)
                        .divide(
                                BigDecimal.valueOf(period + 1),
                                8,
                                RoundingMode.HALF_UP
                        );

        for (int i = index - period + 1;
             i <= index;
             i++) {

            BigDecimal close =
                    prices.get(i).getClosePrice();

            ema =
                    close
                            .subtract(ema)
                            .multiply(multiplier)
                            .add(ema);
        }

        return ema;
    }


    // =========================================================
    // HISTORICAL MACD
    // =========================================================

    private BigDecimal calculateHistoricalMACD(
            List<HistoricalPrice> prices,
            int index) {

        BigDecimal ema12 =
                calculateHistoricalEMA(
                        prices,
                        index,
                        12
                );

        BigDecimal ema26 =
                calculateHistoricalEMA(
                        prices,
                        index,
                        26
                );

        if (ema12 == null || ema26 == null) {
            return null;
        }

        return ema12.subtract(ema26);
    }


    // =========================================================
    // HISTORICAL MACD SIGNAL LINE
    // =========================================================

    private BigDecimal calculateHistoricalMACDSignal(
            List<HistoricalPrice> prices,
            int index,
            int signalPeriod) {

        /*
         * Signal Line = 9-period EMA of MACD.
         */

        if (index < 25 + signalPeriod - 1) {
            return null;
        }

        List<BigDecimal> macdValues =
                new ArrayList<>();

        for (int i = index - signalPeriod + 1;
             i <= index;
             i++) {

            BigDecimal macd =
                    calculateHistoricalMACD(
                            prices,
                            i
                    );

            if (macd == null) {
                return null;
            }

            macdValues.add(macd);
        }

        // Initial SMA
        BigDecimal sum = BigDecimal.ZERO;

        for (BigDecimal macd : macdValues) {
            sum = sum.add(macd);
        }

        BigDecimal signal =
                sum.divide(
                        BigDecimal.valueOf(signalPeriod),
                        8,
                        RoundingMode.HALF_UP
                );

        // EMA multiplier
        BigDecimal multiplier =
                BigDecimal.valueOf(2)
                        .divide(
                                BigDecimal.valueOf(signalPeriod + 1),
                                8,
                                RoundingMode.HALF_UP
                        );

        // Calculate EMA of MACD values
        for (BigDecimal macd : macdValues) {

            signal =
                    macd
                            .subtract(signal)
                            .multiply(multiplier)
                            .add(signal);
        }

        return signal;
    }


    // =========================================================
    // HISTORICAL BOLLINGER BANDS
    // =========================================================

    private BollingerValues calculateHistoricalBollinger(
            List<HistoricalPrice> prices,
            int index,
            int period) {

        /*
         * Use the previous 20 candles.
         * Current candle is NOT included in band calculation.
         */

        if (index < period) {
            return null;
        }

        BigDecimal sum = BigDecimal.ZERO;

        for (int i = index - period;
             i < index;
             i++) {

            sum =
                    sum.add(
                            prices.get(i)
                                    .getClosePrice()
                    );
        }

        BigDecimal middleBand =
                sum.divide(
                        BigDecimal.valueOf(period),
                        8,
                        RoundingMode.HALF_UP
                );

        BigDecimal variance = BigDecimal.ZERO;

        for (int i = index - period;
             i < index;
             i++) {

            BigDecimal close =
                    prices.get(i)
                            .getClosePrice();

            BigDecimal difference =
                    close.subtract(middleBand);

            variance =
                    variance.add(
                            difference.multiply(
                                    difference
                            )
                    );
        }

        variance =
                variance.divide(
                        BigDecimal.valueOf(period),
                        8,
                        RoundingMode.HALF_UP
                );

        BigDecimal standardDeviation =
                BigDecimal.valueOf(
                        Math.sqrt(
                                variance.doubleValue()
                        )
                );

        BigDecimal upperBand =
                middleBand.add(
                        standardDeviation.multiply(
                                BigDecimal.valueOf(2)
                        )
                );

        BigDecimal lowerBand =
                middleBand.subtract(
                        standardDeviation.multiply(
                                BigDecimal.valueOf(2)
                        )
                );

        return new BollingerValues(
                middleBand,
                upperBand,
                lowerBand
        );
    }


    // =========================================================
    // EQUITY CALCULATION
    // =========================================================

    private BigDecimal calculateEquity(
            BigDecimal capital,
            boolean holding,
            BigDecimal currentPrice,
            int quantity) {

        if (!holding) {
            return capital;
        }

        BigDecimal currentPositionValue =
                currentPrice.multiply(
                        BigDecimal.valueOf(quantity)
                );

        return capital.add(currentPositionValue);
    }


    // =========================================================
    // DRAWDOWN
    // =========================================================

    private BigDecimal calculateDrawdown(
            BigDecimal equity,
            BigDecimal peakEquity) {

        if (peakEquity.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        return peakEquity
                .subtract(equity)
                .divide(
                        peakEquity,
                        8,
                        RoundingMode.HALF_UP
                )
                .multiply(
                        BigDecimal.valueOf(100)
                );
    }


    // =========================================================
    // BUILD RESPONSE
    // =========================================================

    private BacktestResponse buildResponse(
            String symbol,
            String strategy,
            BigDecimal initialCapital,
            BigDecimal finalCapital,
            int totalTrades,
            int winningTrades,
            BigDecimal grossProfit,
            BigDecimal grossLoss,
            BigDecimal maxDrawdown,
            List<BacktestTradeResponse> tradeHistory) {

        BigDecimal totalProfitLoss =
                finalCapital.subtract(initialCapital);

        BigDecimal totalReturn =
                totalProfitLoss
                        .divide(
                                initialCapital,
                                8,
                                RoundingMode.HALF_UP
                        )
                        .multiply(
                                BigDecimal.valueOf(100)
                        )
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );

        BigDecimal winRate =
                BigDecimal.ZERO;

        if (totalTrades > 0) {

            winRate =
                    BigDecimal.valueOf(winningTrades)
                            .multiply(
                                    BigDecimal.valueOf(100)
                            )
                            .divide(
                                    BigDecimal.valueOf(totalTrades),
                                    2,
                                    RoundingMode.HALF_UP
                            );
        }

        BigDecimal averageProfit =
                BigDecimal.ZERO;

        if (winningTrades > 0) {

            averageProfit =
                    grossProfit.divide(
                            BigDecimal.valueOf(
                                    winningTrades
                            ),
                            2,
                            RoundingMode.HALF_UP
                    );
        }

        int losingTrades =
                totalTrades - winningTrades;

        BigDecimal averageLoss =
                BigDecimal.ZERO;

        if (losingTrades > 0) {

            averageLoss =
                    grossLoss.divide(
                            BigDecimal.valueOf(
                                    losingTrades
                            ),
                            2,
                            RoundingMode.HALF_UP
                    );
        }

        BigDecimal profitFactor = null;

        if (grossLoss.compareTo(
                BigDecimal.ZERO) > 0) {

            profitFactor =
                    grossProfit.divide(
                            grossLoss,
                            2,
                            RoundingMode.HALF_UP
                    );
        }

        return new BacktestResponse(
                symbol,
                strategy,
                initialCapital,
                finalCapital,
                totalReturn,
                totalTrades,
                winningTrades,
                winRate,
                totalProfitLoss,
                averageProfit,
                averageLoss,
                profitFactor,
                maxDrawdown,
                tradeHistory
        );
    }


    // =========================================================
    // GET STOCK
    // =========================================================

    private Stock getStock(String symbol) {

        return stockRepository
                .findBySymbol(symbol)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Stock not found: " + symbol
                        )
                );
    }


    // =========================================================
    // BOLLINGER VALUE CLASS
    // =========================================================

    private static class BollingerValues {

        private final BigDecimal middleBand;
        private final BigDecimal upperBand;
        private final BigDecimal lowerBand;

        public BollingerValues(
                BigDecimal middleBand,
                BigDecimal upperBand,
                BigDecimal lowerBand) {

            this.middleBand = middleBand;
            this.upperBand = upperBand;
            this.lowerBand = lowerBand;
        }
    }
}