package com.finai.service;

import com.finai.dto.BollingerBandsResponse;
import com.finai.dto.MACDResponse;
import com.finai.entity.HistoricalPrice;
import com.finai.entity.Stock;
import com.finai.repository.HistoricalPriceRepository;
import com.finai.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class TechnicalIndicatorService {

    private final HistoricalPriceRepository historicalPriceRepository;
    private final StockRepository stockRepository;
    private final MarketDataService marketDataService;

    @Transactional
    public List<BigDecimal> calculateSMA(String symbol, int period) {
        validatePeriod(period);

        Stock stock = getStockWithHistoricalData(symbol);
        List<HistoricalPrice> prices = getPrices(stock);

        requireData("SMA", period, prices.size());

        List<BigDecimal> values = new ArrayList<>();

        for (int i = period - 1; i < prices.size(); i++) {
            BigDecimal sum = BigDecimal.ZERO;

            for (int j = i - period + 1; j <= i; j++) {
                sum = sum.add(prices.get(j).getClosePrice());
            }

            values.add(sum.divide(
                    BigDecimal.valueOf(period),
                    4,
                    RoundingMode.HALF_UP
            ));
        }

        return values;
    }

    @Transactional
    public BigDecimal calculateRSI(String symbol, int period) {
        validatePeriod(period);

        Stock stock = getStockWithHistoricalData(symbol);
        List<HistoricalPrice> prices = getPrices(stock);

        if (prices.size() <= period) {
            throw insufficientData(
                    "RSI", period + 1, prices.size()
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

        BigDecimal divisor = BigDecimal.valueOf(period);

        BigDecimal averageGain = totalGain.divide(
                divisor, 10, RoundingMode.HALF_UP
        );

        BigDecimal averageLoss = totalLoss.divide(
                divisor, 10, RoundingMode.HALF_UP
        );

        if (averageLoss.compareTo(BigDecimal.ZERO) == 0) {
            return averageGain.compareTo(BigDecimal.ZERO) == 0
                    ? BigDecimal.valueOf(50)
                    : BigDecimal.valueOf(100);
        }

        BigDecimal relativeStrength = averageGain.divide(
                averageLoss, 10, RoundingMode.HALF_UP
        );

        return BigDecimal.valueOf(100).subtract(
                BigDecimal.valueOf(100).divide(
                        BigDecimal.ONE.add(relativeStrength),
                        10,
                        RoundingMode.HALF_UP
                )
        ).setScale(2, RoundingMode.HALF_UP);
    }

    @Transactional
    public BigDecimal calculateEMA(String symbol, int period) {
        validatePeriod(period);

        Stock stock = getStockWithHistoricalData(symbol);
        List<BigDecimal> closes = getCloses(getPrices(stock));

        requireData("EMA", period, closes.size());

        return calculateEMAFromPrices(closes, period)
                .setScale(2, RoundingMode.HALF_UP);
    }

    @Transactional
    public MACDResponse calculateMACD(String symbol) {
        Stock stock = getStockWithHistoricalData(symbol);
        List<BigDecimal> closes = getCloses(getPrices(stock));

        // EMA26 warm-up plus nine MACD values for the signal line.
        requireData("MACD", 34, closes.size());

        List<BigDecimal> macdValues = new ArrayList<>();

        for (int i = 25; i < closes.size(); i++) {
            List<BigDecimal> history = closes.subList(0, i + 1);

            BigDecimal ema12 = calculateEMAFromPrices(history, 12);
            BigDecimal ema26 = calculateEMAFromPrices(history, 26);

            macdValues.add(ema12.subtract(ema26));
        }

        if (macdValues.size() < 9) {
            throw insufficientData(
                    "MACD signal line", 9, macdValues.size()
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

    @Transactional
    public BollingerBandsResponse calculateBollingerBands(
            String symbol,
            int period) {

        validatePeriod(period);

        Stock stock = getStockWithHistoricalData(symbol);
        List<BigDecimal> closes = getCloses(getPrices(stock));

        requireData("Bollinger Bands", period, closes.size());

        List<BigDecimal> recentPrices = closes.subList(
                closes.size() - period,
                closes.size()
        );

        BigDecimal divisor = BigDecimal.valueOf(period);

        BigDecimal middleBand = recentPrices.stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(divisor, 10, RoundingMode.HALF_UP);

        BigDecimal sumSquaredDifferences = BigDecimal.ZERO;

        for (BigDecimal price : recentPrices) {
            BigDecimal difference = price.subtract(middleBand);

            sumSquaredDifferences = sumSquaredDifferences.add(
                    difference.multiply(difference)
            );
        }

        BigDecimal variance = sumSquaredDifferences.divide(
                divisor, 10, RoundingMode.HALF_UP
        );

        BigDecimal standardDeviation = BigDecimal.valueOf(
                Math.sqrt(variance.doubleValue())
        );

        BigDecimal bandWidth = standardDeviation.multiply(
                BigDecimal.valueOf(2)
        );

        BigDecimal upperBand = middleBand.add(bandWidth);
        BigDecimal lowerBand = middleBand.subtract(bandWidth);

        return new BollingerBandsResponse(
                middleBand.setScale(2, RoundingMode.HALF_UP),
                upperBand.setScale(2, RoundingMode.HALF_UP),
                lowerBand.setScale(2, RoundingMode.HALF_UP)
        );
    }

    private Stock getStockWithHistoricalData(String symbol) {
        String normalizedSymbol = normalizeSymbol(symbol);

        Stock stock = stockRepository.findBySymbol(normalizedSymbol)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Stock not found: " + normalizedSymbol
                ));

        List<HistoricalPrice> prices = getPrices(stock);

        if (prices.isEmpty()) {
            try {
                marketDataService.fetchAndSaveDailyPrices(normalizedSymbol);
            } catch (Exception exception) {
                throw new IllegalStateException(
                        "Unable to load market data for "
                                + normalizedSymbol + ": "
                                + exception.getMessage(),
                        exception
                );
            }

            prices = getPrices(stock);
        }

        if (prices.isEmpty()) {
            throw new IllegalStateException(
                    "No historical closing prices are available for "
                            + normalizedSymbol
            );
        }

        return stock;
    }

    private List<HistoricalPrice> getPrices(Stock stock) {
        return historicalPriceRepository
                .findByStockOrderByTradingDateAsc(stock);
    }

    private List<BigDecimal> getCloses(List<HistoricalPrice> prices) {
        return prices.stream()
                .map(HistoricalPrice::getClosePrice)
                .toList();
    }

    private BigDecimal calculateEMAFromPrices(
            List<BigDecimal> prices,
            int period) {

        if (period <= 0 || prices.size() < period) {
            throw insufficientData("EMA calculation", period, prices.size());
        }

        BigDecimal multiplier = BigDecimal.valueOf(2).divide(
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

    private String normalizeSymbol(String symbol) {
        if (symbol == null || symbol.isBlank()) {
            throw new IllegalArgumentException(
                    "Stock symbol is required"
            );
        }

        return symbol.trim().toUpperCase(Locale.ROOT);
    }

    private void validatePeriod(int period) {
        if (period <= 0) {
            throw new IllegalArgumentException(
                    "Indicator period must be greater than zero"
            );
        }
    }

    private void requireData(
            String indicator,
            int required,
            int actual) {

        if (actual < required) {
            throw insufficientData(indicator, required, actual);
        }
    }

    private IllegalStateException insufficientData(
            String indicator,
            int required,
            int actual) {

        return new IllegalStateException(
                "Not enough historical data for " + indicator
                        + ". Required at least " + required
                        + " closing prices, but found " + actual
        );
    }
}