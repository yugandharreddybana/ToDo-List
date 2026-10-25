package com.productivitysuite.controller;

import com.productivitysuite.dto.health.*;
import com.productivitysuite.service.HealthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.time.LocalDate;

@RestController
@RequestMapping("/health")
@RequiredArgsConstructor
public class HealthController {

    private final HealthService healthService;

    @GetMapping("/logs")
    public ResponseEntity<List<HealthLogResponse>> listLogs(@AuthenticationPrincipal UserDetails p,
            @RequestParam(required = false) LocalDate from, @RequestParam(required = false) LocalDate to) {
        return ResponseEntity.ok(healthService.listLogs(uid(p)).stream()
            .filter(log -> from == null || !log.getDate().isBefore(from))
            .filter(log -> to == null || !log.getDate().isAfter(to)).toList());
    }

    @PutMapping("/logs/{id}")
    public HealthLogResponse updateLog(@AuthenticationPrincipal UserDetails p, @PathVariable UUID id, @Valid @RequestBody HealthLogRequest req) {
        return healthService.updateLog(uid(p), id, req);
    }

    @DeleteMapping("/logs/{id}")
    public ResponseEntity<Void> deleteLog(@AuthenticationPrincipal UserDetails p, @PathVariable UUID id) {
        healthService.deleteLog(uid(p), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/logs")
    public ResponseEntity<HealthLogResponse> upsertLog(
        @AuthenticationPrincipal UserDetails p,
        @Valid @RequestBody HealthLogRequest req
    ) {
        return ResponseEntity.ok(healthService.upsertLog(uid(p), req));
    }

    @GetMapping("/habits")
    public ResponseEntity<List<HabitResponse>> listHabits(@AuthenticationPrincipal UserDetails p) {
        return ResponseEntity.ok(healthService.listHabits(uid(p)));
    }

    @PostMapping("/habits")
    public ResponseEntity<HabitResponse> createHabit(
        @AuthenticationPrincipal UserDetails p,
        @Valid @RequestBody HabitRequest req
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(healthService.createHabit(uid(p), req));
    }

    @PutMapping("/habits/{id}")
    public HabitResponse updateHabit(@AuthenticationPrincipal UserDetails p, @PathVariable UUID id, @Valid @RequestBody HabitRequest req) {
        return healthService.updateHabit(uid(p), id, req);
    }

    @DeleteMapping("/habits/{id}")
    public ResponseEntity<Void> deleteHabit(@AuthenticationPrincipal UserDetails p, @PathVariable UUID id) {
        healthService.deleteHabit(uid(p), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/habits/logs")
    public List<HabitLogResponse> allHabitLogs(@AuthenticationPrincipal UserDetails p,
            @RequestParam LocalDate from, @RequestParam LocalDate to) {
        if (to.isBefore(from) || from.plusYears(2).isBefore(to)) throw new IllegalArgumentException("Invalid log date range");
        return healthService.listHabitLogs(uid(p), from, to);
    }

    @GetMapping("/habits/{id}/logs")
    public List<HabitLogResponse> habitLogs(@AuthenticationPrincipal UserDetails p, @PathVariable UUID id) {
        return healthService.listHabitLogs(uid(p), id);
    }

    @PatchMapping("/habits/{id}/log")
    public ResponseEntity<HabitLogResponse> logHabit(
        @AuthenticationPrincipal UserDetails p,
        @PathVariable UUID id,
        @Valid @RequestBody HabitLogRequest req
    ) {
        return ResponseEntity.ok(healthService.logHabit(uid(p), id, req));
    }

    @PostMapping("/habits/{id}/logs")
    public ResponseEntity<HabitLogResponse> logHabitAtPath(@AuthenticationPrincipal UserDetails p, @PathVariable UUID id,
            @Valid @RequestBody HabitLogRequest req) {
        return ResponseEntity.ok(healthService.logHabit(uid(p), id, req));
    }

    private UUID uid(UserDetails p) { return UUID.fromString(p.getUsername()); }
}
