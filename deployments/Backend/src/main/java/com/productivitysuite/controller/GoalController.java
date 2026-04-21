package com.productivitysuite.controller;

import com.productivitysuite.dto.goal.*;
import com.productivitysuite.service.GoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    @GetMapping
    public ResponseEntity<List<GoalResponse>> list(@AuthenticationPrincipal UserDetails p) {
        return ResponseEntity.ok(goalService.list(uid(p)));
    }

    @PostMapping
    public ResponseEntity<GoalResponse> create(
        @AuthenticationPrincipal UserDetails p,
        @Valid @RequestBody GoalRequest req
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(goalService.create(uid(p), req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GoalResponse> get(@AuthenticationPrincipal UserDetails p, @PathVariable UUID id) {
        return ResponseEntity.ok(goalService.get(uid(p), id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<GoalResponse> update(
        @AuthenticationPrincipal UserDetails p,
        @PathVariable UUID id,
        @Valid @RequestBody GoalRequest req
    ) {
        return ResponseEntity.ok(goalService.update(uid(p), id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserDetails p, @PathVariable UUID id) {
        goalService.delete(uid(p), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/milestones")
    public ResponseEntity<GoalResponse> addMilestone(
        @AuthenticationPrincipal UserDetails p,
        @PathVariable UUID id,
        @Valid @RequestBody MilestoneRequest req
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(goalService.addMilestone(uid(p), id, req));
    }

    @PatchMapping("/{id}/milestones/{mId}")
    public ResponseEntity<GoalResponse> updateMilestone(
        @AuthenticationPrincipal UserDetails p,
        @PathVariable UUID id,
        @PathVariable UUID mId,
        @Valid @RequestBody MilestoneRequest req
    ) {
        return ResponseEntity.ok(goalService.updateMilestone(uid(p), id, mId, req));
    }

    private UUID uid(UserDetails p) { return UUID.fromString(p.getUsername()); }
}
