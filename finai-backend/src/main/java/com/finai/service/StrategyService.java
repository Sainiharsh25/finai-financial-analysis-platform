package com.finai.service;

import com.finai.dto.*;
import com.finai.entity.HistoricalPrice;
import com.finai.repository.HistoricalPriceRepository;
import com.finai.repository.StockRepository;
import com.finai.service.TechnicalIndicatorService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class StrategyService {

    private final TechnicalIndicatorService technicalIndicatorService;
    private final HistoricalPriceRepository historicalPriceRepository;
    private final StockRepository stockRepository;

    public StrategyService(
            TechnicalIndicatorService technicalIndicatorService,
            HistoricalPriceRepository historicalPriceRepository,
            StockRepository stockRepository) {

        this.technicalIndicatorService =
                technicalIndicatorService;

        this.historicalPriceRepository =
                historicalPriceRepository;

        this.stockRepository =
                stockRepository;
    }

    public StrategySignalResponse calculateRSIStrategy(
            String symbol) {

        BigDecimal rsi =
                technicalIndicatorService
                        .calculateRSI(symbol, 14);

        String signal;
        String reason;

        if (rsi.compareTo(BigDecimal.valueOf(30)) < 0) {

            signal = "BUY";

            reason =
                    "RSI is below 30, indicating an "
                            + "oversold condition.";

        } else if (rsi.compareTo(BigDecimal.valueOf(70)) > 0) {

            signal = "SELL";

            reason =
                    "RSI is above 70, indicating an "
                            + "overbought condition.";

        } else {

            signal = "HOLD";

            reason =
                    "RSI is between 30 and 70, so there "
                            + "is no strong RSI signal.";
        }

        return new StrategySignalResponse(
                symbol.toUpperCase(),
                "RSI Strategy",
                rsi,
                signal,
                reason
        );
    }

    public StrategySignalResponse calculateEMACrossoverStrategy(
            String symbol) {

        BigDecimal shortEMA =
                technicalIndicatorService
                        .calculateEMA(symbol, 20);

        BigDecimal longEMA =
                technicalIndicatorService
                        .calculateEMA(symbol, 50);

        String signal;
        String reason;

        if (shortEMA.compareTo(longEMA) > 0) {

            signal = "BUY";

            reason =
                    "20-period EMA is above the 50-period EMA, "
                            + "indicating stronger short-term momentum.";

        } else if (shortEMA.compareTo(longEMA) < 0) {

            signal = "SELL";

            reason =
                    "20-period EMA is below the 50-period EMA, "
                            + "indicating weaker short-term momentum.";

        } else {

            signal = "HOLD";

            reason =
                    "20-period EMA is equal to the 50-period EMA.";
        }

        // Difference between the two EMAs
        BigDecimal difference =
                shortEMA.subtract(longEMA);

        return new StrategySignalResponse(
                symbol.toUpperCase(),
                "EMA Crossover Strategy",
                difference,
                signal,
                reason
        );
    }

    public MACDStrategyResponse calculateMACDStrategy(String symbol) {

        MACDResponse macdData =
                technicalIndicatorService.calculateMACD(symbol);

        BigDecimal macd = macdData.getMacd();
        BigDecimal signalLine = macdData.getSignal();
        BigDecimal histogram = macdData.getHistogram();

        String tradeSignal;
        String reason;

        if (macd.compareTo(signalLine) > 0) {

            tradeSignal = "BUY";

            reason =
                    "MACD is above the signal line, "
                            + "indicating stronger momentum.";

        } else if (macd.compareTo(signalLine) < 0) {

            tradeSignal = "SELL";

            reason =
                    "MACD is below the signal line, "
                            + "indicating weaker momentum.";

        } else {

            tradeSignal = "HOLD";

            reason =
                    "MACD is equal to the signal line, "
                            + "so there is no clear momentum signal.";
        }

        return new MACDStrategyResponse(
                symbol.toUpperCase(),
                "MACD Strategy",
                macd,
                signalLine,
                histogram,
                tradeSignal,
                reason
        );
    }

    public BollingerStrategyResponse calculateBollingerStrategy(
            String symbol) {

        BollingerBandsResponse bands =
                technicalIndicatorService
                        .calculateBollingerBands(symbol, 20);

        List<HistoricalPrice> prices =
                historicalPriceRepository
                        .findByStockOrderByTradingDateAsc(
                                stockRepository
                                        .findBySymbol(
                                                symbol.toUpperCase())
                                        .orElseThrow(() ->
                                                new RuntimeException(
                                                        "Stock not found"))
                        );

        BigDecimal currentPrice =
                prices.get(prices.size() - 1).getClosePrice();

        BigDecimal upperBand = bands.getUpperBand();
        BigDecimal middleBand = bands.getMiddleBand();
        BigDecimal lowerBand = bands.getLowerBand();

        String tradeSignal;
        String reason;

        if (currentPrice.compareTo(lowerBand) < 0) {

            tradeSignal = "BUY";

            reason =
                    "Price is below the lower Bollinger Band, "
                            + "indicating a potentially oversold condition.";

        } else if (currentPrice.compareTo(upperBand) > 0) {

            tradeSignal = "SELL";

            reason =
                    "Price is above the upper Bollinger Band, "
                            + "indicating a potentially overbought condition.";

        } else {

            tradeSignal = "HOLD";

            reason =
                    "Price is within the Bollinger Bands, "
                            + "so there is no strong signal.";
        }

        return new BollingerStrategyResponse(
                symbol.toUpperCase(),
                "Bollinger Bands Strategy",
                currentPrice,
                upperBand,
                middleBand,
                lowerBand,
                tradeSignal,
                reason
        );
    }
}