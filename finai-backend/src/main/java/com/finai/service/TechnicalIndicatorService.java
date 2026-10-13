package com.finai.service;

import com.finai.dto.BollingerBandsResponse;
import com.finai.dto.MACDResponse;
import com.finai.entity.HistoricalPrice;
import com.finai.entity.Stock;
import com.finai.repository.HistoricalPriceRepository;
import com.finai.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TechnicalIndicatorService {

    private final HistoricalPriceRepository historicalPriceRepository;
    private final StockRepository stockRepository;

    public List<BigDecimal> calculateSMA(
            String symbol,
            int period) {

        Stock stock = stockRepository
                .findBySymbol(symbol.toUpperCase())
                .orElseThrow(() ->
                        new RuntimeException("Stock not found"));

        List<HistoricalPrice> prices =
                historicalPriceRepository
                        .findByStockOrderByTradingDateAsc(stock);

        if (prices.size() < period) {
            throw new RuntimeException(
                    "Not enough data to calculate SMA"
            );
        }

        List<BigDecimal> smaValues = new ArrayList<>();

        for (int i = period - 1; i < prices.size(); i++) {

            BigDecimal sum = BigDecimal.ZERO;

            for (int j = i - period + 1; j <= i; j++) {

                sum = sum.add(
                        prices.get(j).getClosePrice()
                );
            }

            BigDecimal average = sum.divide(
                    BigDecimal.valueOf(period),
                    4,
                    RoundingMode.HALF_UP
            );

            smaValues.add(average);
        }

        return smaValues;
    }

    public BigDecimal calculateRSI(
            String symbol,
            int period) {

        Stock stock = stockRepository
                .findBySymbol(symbol.toUpperCase())
                .orElseThrow(() ->
                        new RuntimeException("Stock not found"));

        List<HistoricalPrice> prices =
                historicalPriceRepository
                        .findByStockOrderByTradingDateAsc(stock);

        if (prices.size() <= period) {
            throw new RuntimeException(
                    "Not enough data to calculate RSI"
            );
        }

        BigDecimal totalGain = BigDecimal.ZERO;
        BigDecimal totalLoss = BigDecimal.ZERO;

        for (int i = 1; i <= period; i++) {

            BigDecimal change =
                    prices.get(i)
                            .getClosePrice()
                            .subtract(
                                    prices.get(i - 1)
                                            .getClosePrice()
                            );

            if (change.compareTo(BigDecimal.ZERO) > 0) {
                totalGain = totalGain.add(change);
            } else {
                totalLoss = totalLoss.add(change.abs());
            }
        }

        BigDecimal averageGain =
                totalGain.divide(
                        BigDecimal.valueOf(period),
                        4,
                        RoundingMode.HALF_UP
                );

        BigDecimal averageLoss =
                totalLoss.divide(
                        BigDecimal.valueOf(period),
                        4,
                        RoundingMode.HALF_UP
                );

        if (averageLoss.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.valueOf(100);
        }

        BigDecimal rs =
                averageGain.divide(
                        averageLoss,
                        4,
                        RoundingMode.HALF_UP
                );

        return BigDecimal.valueOf(100)
                .subtract(
                        BigDecimal.valueOf(100)
                                .divide(
                                        BigDecimal.ONE.add(rs),
                                        4,
                                        RoundingMode.HALF_UP
                                )
                )
                .setScale(2, RoundingMode.HALF_UP);
    }
    public BigDecimal calculateEMA(String symbol, int period) {

        Stock stock = stockRepository
                .findBySymbol(symbol.toUpperCase())
                .orElseThrow(() ->
                        new RuntimeException("Stock not found"));

        List<HistoricalPrice> prices =
                historicalPriceRepository
                        .findByStockOrderByTradingDateAsc(stock);

        if (prices.size() < period) {
            throw new RuntimeException(
                    "Not enough historical data for EMA"
            );
        }

        BigDecimal multiplier =
                BigDecimal.valueOf(2.0 / (period + 1));

        // Start EMA with SMA
        BigDecimal ema = prices.subList(0, period)
                .stream()
                .map(HistoricalPrice::getClosePrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(
                        BigDecimal.valueOf(period),
                        10,
                        RoundingMode.HALF_UP
                );

        // Calculate remaining EMA values
        for (int i = period; i < prices.size(); i++) {

            BigDecimal close =
                    prices.get(i).getClosePrice();

            ema = close
                    .subtract(ema)
                    .multiply(multiplier)
                    .add(ema);
        }

        return ema.setScale(2, RoundingMode.HALF_UP);
    }

    public MACDResponse calculateMACD(String symbol) {

        Stock stock = stockRepository
                .findBySymbol(symbol.toUpperCase())
                .orElseThrow(() ->
                        new RuntimeException("Stock not found"));

        List<HistoricalPrice> prices =
                historicalPriceRepository
                        .findByStockOrderByTradingDateAsc(stock);

        if (prices.size() < 35) {
            throw new RuntimeException(
                    "Not enough historical data for MACD");
        }

        List<BigDecimal> closes = prices.stream()
                .map(HistoricalPrice::getClosePrice)
                .toList();

        // Calculate MACD values for each available day
        List<BigDecimal> macdValues = new ArrayList<>();

        for (int i = 26; i < closes.size(); i++) {

            List<BigDecimal> priceHistory =
                    closes.subList(0, i + 1);

            BigDecimal ema12 =
                    calculateEMAFromPrices(priceHistory, 12);

            BigDecimal ema26 =
                    calculateEMAFromPrices(priceHistory, 26);

            BigDecimal macdValue =
                    ema12.subtract(ema26);

            macdValues.add(macdValue);
        }

        if (macdValues.size() < 9) {
            throw new RuntimeException(
                    "Not enough MACD data to calculate signal line");
        }

        // Signal line = 9-period EMA of MACD values
        BigDecimal signal =
                calculateEMAFromPrices(macdValues, 9);

        // Current MACD
        BigDecimal currentMacd =
                macdValues.get(macdValues.size() - 1);

        // Histogram = MACD - Signal
        BigDecimal histogram =
                currentMacd.subtract(signal);

        return new MACDResponse(
                currentMacd.setScale(2, RoundingMode.HALF_UP),
                signal.setScale(2, RoundingMode.HALF_UP),
                histogram.setScale(2, RoundingMode.HALF_UP)
        );
    }

    private BigDecimal calculateEMAFromPrices(
            List<BigDecimal> prices,
            int period) {

        if (prices.size() < period) {
            throw new RuntimeException(
                    "Not enough data for EMA"
            );
        }

        BigDecimal multiplier =
                BigDecimal.valueOf(2.0 / (period + 1));

        BigDecimal ema = prices.subList(0, period)
                .stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(
                        BigDecimal.valueOf(period),
                        10,
                        RoundingMode.HALF_UP
                );

        for (int i = period; i < prices.size(); i++) {

            BigDecimal price = prices.get(i);

            ema = price
                    .subtract(ema)
                    .multiply(multiplier)
                    .add(ema);
        }

        return ema;
    }

    public BollingerBandsResponse calculateBollingerBands(
            String symbol,
            int period) {

        Stock stock = stockRepository
                .findBySymbol(symbol.toUpperCase())
                .orElseThrow(() ->
                        new RuntimeException("Stock not found"));

        List<HistoricalPrice> prices =
                historicalPriceRepository
                        .findByStockOrderByTradingDateAsc(stock);

        if (prices.size() < period) {
            throw new RuntimeException(
                    "Not enough historical data for Bollinger Bands"
            );
        }

        List<BigDecimal> closes = prices.stream()
                .map(HistoricalPrice::getClosePrice)
                .toList();

        List<BigDecimal> recentPrices =
                closes.subList(
                        closes.size() - period,
                        closes.size()
                );

        // Middle Band = SMA
        BigDecimal middleBand =
                recentPrices.stream()
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        )
                        .divide(
                                BigDecimal.valueOf(period),
                                10,
                                RoundingMode.HALF_UP
                        );

        // Calculate variance
        BigDecimal sumSquaredDifferences =
                BigDecimal.ZERO;

        for (BigDecimal price : recentPrices) {

            BigDecimal difference =
                    price.subtract(middleBand);

            sumSquaredDifferences =
                    sumSquaredDifferences.add(
                            difference.multiply(difference)
                    );
        }

        BigDecimal variance =
                sumSquaredDifferences.divide(
                        BigDecimal.valueOf(period),
                        10,
                        RoundingMode.HALF_UP
                );

        double standardDeviation =
                Math.sqrt(variance.doubleValue());

        BigDecimal stdDev =
                BigDecimal.valueOf(standardDeviation);

        // Upper = Middle + 2 × SD
        BigDecimal upperBand =
                middleBand.add(
                        stdDev.multiply(BigDecimal.valueOf(2))
                );

        // Lower = Middle - 2 × SD
        BigDecimal lowerBand =
                middleBand.subtract(
                        stdDev.multiply(BigDecimal.valueOf(2))
                );

        return new BollingerBandsResponse(
                middleBand.setScale(2, RoundingMode.HALF_UP),
                upperBand.setScale(2, RoundingMode.HALF_UP),
                lowerBand.setScale(2, RoundingMode.HALF_UP)
        );
    }
}