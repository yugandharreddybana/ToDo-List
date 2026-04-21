package com.productivitysuite.controller;

import com.productivitysuite.dto.health.*;
import com.productivitysuite.entity.Habit;
import com.productivitysuite.entity.HabitLog;
import com.productivitysuite.service.HealthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/health")
@RequiredArgsConstructor
public class HealthController {

    private final HealthService healthService;

    @GetMapping("/logs")
    public ResponseEntity<List<HealthLogResponse>> listLogs(@AuthenticationPrincipal UserDetails p) {
        return ResponseEntity.ok(healthService.listLogs(uid(p)));
    }

    @PostMapping("/logs")
    public ResponseEntity<HealthLogResponse> upsertLog(
        @AuthenticationPrincipal UserDetails p,
        @Valid @RequestBody HealthLogRequest req
    ) {
        return ResponseEntity.ok(healthService.upsertLog(uid(p), req));
    }

    @GetMapping("/habits")
    public ResponseEntity<List<Habit>> listHabits(@AuthenticationPrincipal UserDetails p) {
        return ResponseEntity.ok(healthService.listHabits(uid(p)));
    }

    @PostMapping("/habits")
    public ResponseEntity<Habit> createHabit(
        @AuthenticationPrincipal UserDetails p,
        @Valid @RequestBody HabitRequest req
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(healthService.createHabit(uid(p), req));
    }

    @PatchMapping("/habits/{id}/log")
    public ResponseEntity<HabitLog> logHabit(
        @AuthenticationPrincipal UserDetails p,
        @PathVariable UUID id,
        @Valid @RequestBody HabitLogRequest req
    ) {
        return ResponseEntity.ok(healthService.logHabit(uid(p), id, req));
    }

    private UUID uid(UserDetails p) { return UUID.fromString(p.getUsername()); }
}
