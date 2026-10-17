package com.finai.controller;

import com.finai.dto.AIAnalysisResponse;
import com.finai.dto.BollingerBandsResponse;
import com.finai.dto.MACDResponse;
import com.finai.entity.HistoricalPrice;
import com.finai.entity.Stock;
import com.finai.service.TechnicalIndicatorService;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.*;
import com.finai.repository.HistoricalPriceRepository;
import com.finai.repository.StockRepository;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final HistoricalPriceRepository historicalPriceRepository;
    private final StockRepository stockRepository;

    private final ChatClient chatClient;
    private final TechnicalIndicatorService technicalIndicatorService;

    public AIController(
            ChatClient.Builder chatClientBuilder,
            TechnicalIndicatorService technicalIndicatorService,
            HistoricalPriceRepository historicalPriceRepository,
            StockRepository stockRepository) {

        this.chatClient = chatClientBuilder.build();
        this.technicalIndicatorService = technicalIndicatorService;
        this.historicalPriceRepository = historicalPriceRepository;
        this.stockRepository = stockRepository;
    }

    @GetMapping("/analysis/{symbol}")
    public AIAnalysisResponse analyzeStock(@PathVariable String symbol) {

        // Java calculates the exact values
        BigDecimal rsi =
                technicalIndicatorService.calculateRSI(symbol, 14);

        BigDecimal ema20 =
                technicalIndicatorService.calculateEMA(symbol, 20);

        MACDResponse macd =
                technicalIndicatorService.calculateMACD(symbol);

        BollingerBandsResponse bollinger =
                technicalIndicatorService.calculateBollingerBands(symbol, 20);

        // Java determines the qualitative signals
        String rsiSignal;

        if (rsi.compareTo(BigDecimal.valueOf(30)) < 0) {
            rsiSignal = "OVERSOLD";
        } else if (rsi.compareTo(BigDecimal.valueOf(70)) > 0) {
            rsiSignal = "OVERBOUGHT";
        } else {
            rsiSignal = "NEUTRAL";
        }

        String macdSignal;

        if (macd.getMacd().compareTo(macd.getSignal()) > 0) {
            macdSignal = "BULLISH";
        } else if (macd.getMacd().compareTo(macd.getSignal()) < 0) {
            macdSignal = "BEARISH";
        } else {
            macdSignal = "NEUTRAL";
        }

        Stock stock = stockRepository.findBySymbol(symbol)
                .orElseGet(() -> {
                    Stock newStock = Stock.builder()
                            .symbol(symbol)
                            .companyName(symbol)
                            .exchange("NSE")
                            .build();

                    return stockRepository.save(newStock);
                });

        List<HistoricalPrice> prices =
                historicalPriceRepository.findByStockOrderByTradingDateAsc(stock);

        if (prices.isEmpty()) {
            throw new RuntimeException("No historical price data found for " + symbol);
        }

        BigDecimal currentPrice =
                prices.get(prices.size() - 1).getClosePrice();

        String bollingerSignal;

        if (currentPrice.compareTo(bollinger.getLowerBand()) < 0) {
            bollingerSignal = "BELOW_LOWER_BAND";
        } else if (currentPrice.compareTo(bollinger.getUpperBand()) > 0) {
            bollingerSignal = "ABOVE_UPPER_BAND";
        } else {
            bollingerSignal = "WITHIN_BANDS";
        }

        // AI only receives qualitative information
        String prompt = """
        You are an educational financial analysis assistant.

        Explain the following PRE-CALCULATED technical signals
        in simple and neutral language.

        Stock: %s

        RSI Signal: %s
        MACD Signal: %s
        Bollinger Bands Signal: %s

        STRICT RULES:

        1. Explain only what each signal generally means.
        2. Do NOT predict whether the stock price will rise or fall.
        3. Do NOT say the stock is going to recover, decline, increase,
           decrease, or continue in any direction.
        4. Do NOT recommend buying, selling, or holding the stock.
        5. Do NOT say something is a good or bad investment.
        6. Do NOT introduce indicators that are not provided.
        7. Do NOT create or calculate numerical values.
        8. Do NOT mention numerical values.
        9. Do NOT change the provided signals.
        10. Do not claim that WITHIN_BANDS means the stock is stable.
        11. Clearly state that these are technical-analysis signals,
            not financial advice.
        12. Keep the explanation under 150 words.

        Explain the signals one by one and then give a short neutral summary.
        """.formatted(
                symbol,
                rsiSignal,
                macdSignal,
                bollingerSignal
        );

        String aiExplanation = chatClient.prompt()
                .user(prompt)
                .call()
                .content();

        return new AIAnalysisResponse(
                symbol,
                rsi,
                ema20,
                macd.getMacd(),
                macd.getSignal(),
                macd.getHistogram(),
                bollinger.getUpperBand(),
                bollinger.getMiddleBand(),
                bollinger.getLowerBand(),
                aiExplanation
        );
    }
}