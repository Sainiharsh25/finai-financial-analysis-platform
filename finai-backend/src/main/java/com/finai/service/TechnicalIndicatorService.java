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
    private final MarketDataService marketDataService;

    public List<BigDecimal> calculateSMA(String symbol, int period) {
        validatePeriod(period);

        Stock stock = getStockWithHistoricalData(symbol);
        List<HistoricalPrice> prices = getPrices(stock);

        if (prices.size() < period) {
            throw insufficientData("SMA", period, prices.size());
        }

        List<BigDecimal> smaValues = new ArrayList<>();

        for (int i = period - 1; i < prices.size(); i++) {
            BigDecimal sum = BigDecimal.ZERO;

            for (int j = i - period + 1; j <= i; j++) {
                sum = sum.add(prices.get(j).getClosePrice());
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

    public BigDecimal calculateRSI(String symbol, int period) {
        validatePeriod(period);

        Stock stock = getStockWithHistoricalData(symbol);
        List<HistoricalPrice> prices = getPrices(stock);

        // RSI period 14 requires at least 15 closing prices.
        if (prices.size() <= period) {
            throw new RuntimeException(
                    "Not enough historical data for RSI. Required at least "
                            + (period + 1)
                            + " closing prices, but found "
                            + prices.size()
            );
        }

        BigDecimal totalGain = BigDecimal.ZERO;
        BigDecimal totalLoss = BigDecimal.ZERO;

        for (int i = 1; i <= period; i++) {
            BigDecimal change = prices.get(i).getClosePrice()
                    .subtract(prices.get(i - 1).getClosePrice());

            if (change.compareTo(BigDecimal.ZERO) > 0) {
                totalGain = totalGain.add(change);
            } else {
                totalLoss = totalLoss.add(change.abs());
            }
        }

        BigDecimal averageGain = totalGain.divide(
                BigDecimal.valueOf(period),
                10,
                RoundingMode.HALF_UP
        );

        BigDecimal averageLoss = totalLoss.divide(
                BigDecimal.valueOf(period),
                10,
                RoundingMode.HALF_UP
        );

        if (averageLoss.compareTo(BigDecimal.ZERO) == 0) {
            if (averageGain.compareTo(BigDecimal.ZERO) == 0) {
                return BigDecimal.valueOf(50);
            }
            return BigDecimal.valueOf(100);
        }

        BigDecimal relativeStrength = averageGain.divide(
                averageLoss,
                10,
                RoundingMode.HALF_UP
        );

        return BigDecimal.valueOf(100)
                .subtract(
                        BigDecimal.valueOf(100).divide(
                                BigDecimal.ONE.add(relativeStrength),
                                10,
                                RoundingMode.HALF_UP
                        )
                )
                .setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal calculateEMA(String symbol, int period) {
        validatePeriod(period);

        Stock stock = getStockWithHistoricalData(symbol);
        List<HistoricalPrice> prices = getPrices(stock);

        if (prices.size() < period) {
            throw insufficientData("EMA", period, prices.size());
        }

        List<BigDecimal> closes = prices.stream()
                .map(HistoricalPrice::getClosePrice)
                .toList();

        BigDecimal ema = calculateEMAFromPrices(closes, period);

        return ema.setScale(2, RoundingMode.HALF_UP);
    }

    public MACDResponse calculateMACD(String symbol) {
        Stock stock = getStockWithHistoricalData(symbol);
        List<HistoricalPrice> prices = getPrices(stock);

        List<BigDecimal> closes = prices.stream()
                .map(HistoricalPrice::getClosePrice)
                .toList();

        // Need enough prices to calculate 9 MACD values after EMA26 warm-up.
        if (closes.size() < 34) {
            throw insufficientData("MACD", 34, closes.size());
        }

        List<BigDecimal> macdValues = new ArrayList<>();

        for (int i = 25; i < closes.size(); i++) {
            List<BigDecimal> priceHistory = closes.subList(0, i + 1);

            BigDecimal ema12 = calculateEMAFromPrices(priceHistory, 12);
            BigDecimal ema26 = calculateEMAFromPrices(priceHistory, 26);

            macdValues.add(ema12.subtract(ema26));
        }

        if (macdValues.size() < 9) {
            throw new RuntimeException(
                    "Not enough MACD values to calculate the signal line"
            );
        }

        BigDecimal signal = calculateEMAFromPrices(macdValues, 9);
        BigDecimal currentMacd = macdValues.get(macdValues.size() - 1);
        BigDecimal histogram = currentMacd.subtract(signal);

        return new MACDResponse(
                currentMacd.setScale(2, RoundingMode.HALF_UP),
                signal.setScale(2, RoundingMode.HALF_UP),
                histogram.setScale(2, RoundingMode.HALF_UP)
        );
    }

    private BigDecimal calculateEMAFromPrices(
            List<BigDecimal> prices,
            int period) {

        if (period <= 0 || prices.size() < period) {
            throw new RuntimeException(
                    "Not enough data for EMA calculation. Required "
                            + period + " values, but found " + prices.size()
            );
        }

        BigDecimal multiplier = BigDecimal.valueOf(2)
                .divide(
                        BigDecimal.valueOf(period + 1L),
                        12,
                        RoundingMode.HALF_UP
                );

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

            ema = price.subtract(ema)
                    .multiply(multiplier)
                    .add(ema);
        }

        return ema;
    }

    public BollingerBandsResponse calculateBollingerBands(
            String symbol,
            int period) {

        validatePeriod(period);

        Stock stock = getStockWithHistoricalData(symbol);
        List<HistoricalPrice> prices = getPrices(stock);

        if (prices.size() < period) {
            throw insufficientData(
                    "Bollinger Bands", period, prices.size()
            );
        }

        List<BigDecimal> closes = prices.stream()
                .map(HistoricalPrice::getClosePrice)
                .toList();

        List<BigDecimal> recentPrices = closes.subList(
                closes.size() - period,
                closes.size()
        );

        BigDecimal middleBand = recentPrices.stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(
                        BigDecimal.valueOf(period),
                        10,
                        RoundingMode.HALF_UP
                );

        BigDecimal sumSquaredDifferences = BigDecimal.ZERO;

        for (BigDecimal price : recentPrices) {
            BigDecimal difference = price.subtract(middleBand);

            sumSquaredDifferences = sumSquaredDifferences.add(
                    difference.multiply(difference)
            );
        }

        // Population standard deviation, consistent with the original logic.
        BigDecimal variance = sumSquaredDifferences.divide(
                BigDecimal.valueOf(period),
                10,
                RoundingMode.HALF_UP
        );

        BigDecimal stdDev = BigDecimal.valueOf(
                Math.sqrt(variance.doubleValue())
        );

        BigDecimal bandWidth = stdDev.multiply(BigDecimal.valueOf(2));
        BigDecimal upperBand = middleBand.add(bandWidth);
        BigDecimal lowerBand = middleBand.subtract(bandWidth);

        return new BollingerBandsResponse(
                middleBand.setScale(2, RoundingMode.HALF_UP),
                upperBand.setScale(2, RoundingMode.HALF_UP),
                lowerBand.setScale(2, RoundingMode.HALF_UP)
        );
    }


    private Stock getStockWithHistoricalData(String symbol) {
        if (symbol == null || symbol.isBlank()) {
            throw new IllegalArgumentException("Stock symbol is required");
        }

        String normalizedSymbol = symbol.trim().toUpperCase();

        try {
            marketDataService.fetchAndSaveDailyPrices(normalizedSymbol);
        } catch (Exception e) {
            throw new RuntimeException(
                    "Unable to load market data for "
                            + normalizedSymbol + ": " + e.getMessage(),
                    e
            );
        }

        return stockRepository.findBySymbol(normalizedSymbol)
                .orElseThrow(() -> new RuntimeException(
                        "Stock not found: " + normalizedSymbol
                ));
    }


    private List<HistoricalPrice> getPrices(Stock stock) {
        return historicalPriceRepository
                .findByStockOrderByTradingDateAsc(stock);
    }

    private void validatePeriod(int period) {
        if (period <= 0) {
            throw new IllegalArgumentException(
                    "Indicator period must be greater than zero"
            );
        }
    }

    private RuntimeException insufficientData(
            String indicator,
            int required,
            int actual) {

        return new RuntimeException(
                "Not enough historical data for " + indicator
                        + ". Required at least " + required
                        + " closing prices, but found " + actual
        );
    }
}
