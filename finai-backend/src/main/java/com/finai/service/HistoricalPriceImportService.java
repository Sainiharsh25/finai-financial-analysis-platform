package com.finai.service;

import com.finai.entity.HistoricalPrice;
import com.finai.entity.Stock;
import com.finai.repository.HistoricalPriceRepository;
import com.finai.repository.StockRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

@Service
public class HistoricalPriceImportService {

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd-MMM-yyyy", Locale.ENGLISH);

    private final HistoricalPriceRepository historicalPriceRepository;
    private final StockRepository stockRepository;

    public HistoricalPriceImportService(
            HistoricalPriceRepository historicalPriceRepository,
            StockRepository stockRepository) {
        this.historicalPriceRepository = historicalPriceRepository;
        this.stockRepository = stockRepository;
    }

    @Transactional
    public int importCsv(Path csvPath) throws IOException {
        Stock stock = stockRepository.findBySymbol("RELIANCE")
                .orElseThrow(() ->
                        new IllegalStateException("RELIANCE stock not found"));

        Set<LocalDate> existingDates = new HashSet<>();
        historicalPriceRepository
                .findByStockOrderByTradingDateAsc(stock)
                .forEach(price -> existingDates.add(price.getTradingDate()));

        int imported = 0;

        try (BufferedReader reader = Files.newBufferedReader(
                csvPath, StandardCharsets.UTF_8)) {

            String header = reader.readLine();
            if (header == null) {
                throw new IllegalArgumentException("CSV file is empty");
            }

            String[] headers = header.replace("\uFEFF", "").split(",", -1);
            int dateCol = column(headers, "DATE");
            int openCol = column(headers, "OPEN");
            int highCol = column(headers, "HIGH");
            int lowCol = column(headers, "LOW");
            int closeCol = column(headers, "CLOSE");
            int volumeCol = column(headers, "VOLUME");

            String line;
            int lineNumber = 1;

            while ((line = reader.readLine()) != null) {
                lineNumber++;

                if (line.isBlank()) {
                    continue;
                }

                String[] fields = line.split(",", -1);
                int maxCol = Math.max(
                        Math.max(dateCol, openCol),
                        Math.max(Math.max(highCol, lowCol),
                                Math.max(closeCol, volumeCol))
                );

                if (fields.length <= maxCol) {
                    throw new IllegalArgumentException(
                            "Invalid CSV row at line " + lineNumber);
                }

                LocalDate date = LocalDate.parse(
                        fields[dateCol].trim(), DATE_FORMAT);

                if (!existingDates.add(date)) {
                    continue;
                }

                HistoricalPrice price = HistoricalPrice.builder()
                        .stock(stock)
                        .tradingDate(date)
                        .openPrice(decimal(fields[openCol]))
                        .highPrice(decimal(fields[highCol]))
                        .lowPrice(decimal(fields[lowCol]))
                        .closePrice(decimal(fields[closeCol]))
                        .volume(Long.parseLong(fields[volumeCol].trim()))
                        .build();

                historicalPriceRepository.save(price);
                imported++;
            }
        }

        return imported;
    }

    private int column(String[] headers, String name) {
        for (int i = 0; i < headers.length; i++) {
            if (headers[i].trim().equalsIgnoreCase(name)) {
                return i;
            }
        }
        throw new IllegalArgumentException(
                "CSV column not found: " + name);
    }

    private BigDecimal decimal(String value) {
        return new BigDecimal(value.trim().replace(",", ""));
    }
}
