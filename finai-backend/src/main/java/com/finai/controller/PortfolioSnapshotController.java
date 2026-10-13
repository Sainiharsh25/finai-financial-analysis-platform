
package com.finai.controller;

import com.finai.entity.PortfolioSnapshot;
import com.finai.service.PortfolioSnapshotService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/portfolio/snapshots")
@RequiredArgsConstructor
public class PortfolioSnapshotController {

    private final PortfolioSnapshotService snapshotService;

    @PostMapping
    public PortfolioSnapshot saveTodaySnapshot(
            Authentication authentication) {
        return snapshotService.saveTodaySnapshot(authentication);
    }

    @GetMapping
    public List<PortfolioSnapshot> getHistory(
            Authentication authentication,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate) {

        return snapshotService.getHistory(
                authentication, startDate, endDate);
    }
}
