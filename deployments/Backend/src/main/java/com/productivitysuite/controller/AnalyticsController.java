package com.productivitysuite.controller;

import com.productivitysuite.dto.analytics.*;
import com.productivitysuite.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/summary")
    public ResponseEntity<AnalyticsSummaryResponse> summary(
        @AuthenticationPrincipal UserDetails p,
        @RequestParam(defaultValue = "week") String period
    ) {
        return ResponseEntity.ok(analyticsService.summary(uid(p), period));
    }

    @GetMapping("/productivity-heatmap")
    public ResponseEntity<HeatmapResponse> heatmap(@AuthenticationPrincipal UserDetails p) {
        return ResponseEntity.ok(analyticsService.heatmap(uid(p)));
    }

    @GetMapping("/focus-time")
    public ResponseEntity<AnalyticsSummaryResponse> focusTime(
        @AuthenticationPrincipal UserDetails p,
        @RequestParam(defaultValue = "week") String period
    ) {
        return ResponseEntity.ok(analyticsService.summary(uid(p), period));
    }

    private UUID uid(UserDetails p) { return UUID.fromString(p.getUsername()); }
}
