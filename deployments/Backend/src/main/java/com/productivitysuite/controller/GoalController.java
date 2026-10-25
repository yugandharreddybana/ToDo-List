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
import java.util.Map;

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

    @RequestMapping(value = "/{id}", method = {RequestMethod.PATCH, RequestMethod.PUT})
    public ResponseEntity<GoalResponse> update(
        @AuthenticationPrincipal UserDetails p,
        @PathVariable UUID id,
        @Valid @RequestBody GoalPatchRequest req
    ) {
        return ResponseEntity.ok(goalService.update(uid(p), id, req));
    }

    @PatchMapping("/{id}/progress")
    public GoalResponse progress(@AuthenticationPrincipal UserDetails p, @PathVariable UUID id, @RequestBody Map<String, Integer> body) {
        if (body.get("progress") == null) throw new IllegalArgumentException("progress is required");
        return goalService.updateProgress(uid(p), id, body.get("progress"));
    }

    @GetMapping("/{id}/milestones")
    public List<GoalResponse.MilestoneResponse> milestones(@AuthenticationPrincipal UserDetails p, @PathVariable UUID id) {
        return goalService.milestones(uid(p), id);
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
        @RequestBody Map<String, Boolean> req
    ) {
        if (req.get("completed") == null) throw new IllegalArgumentException("completed is required");
        return ResponseEntity.ok(goalService.setMilestoneCompleted(uid(p), id, mId, req.get("completed")));
    }

    @DeleteMapping("/{id}/milestones/{mId}")
    public ResponseEntity<Void> deleteMilestone(@AuthenticationPrincipal UserDetails p, @PathVariable UUID id, @PathVariable UUID mId) {
        goalService.deleteMilestone(uid(p), id, mId);
        return ResponseEntity.noContent().build();
    }

    private UUID uid(UserDetails p) { return UUID.fromString(p.getUsername()); }
}
