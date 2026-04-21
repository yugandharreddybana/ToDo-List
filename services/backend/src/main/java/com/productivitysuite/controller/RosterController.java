package com.productivitysuite.controller;

import com.productivitysuite.dto.roster.*;
import com.productivitysuite.service.RosterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/roster/shifts")
@RequiredArgsConstructor
public class RosterController {

    private final RosterService rosterService;

    @GetMapping
    public ResponseEntity<List<ShiftResponse>> list(@AuthenticationPrincipal UserDetails p) {
        return ResponseEntity.ok(rosterService.list(uid(p)));
    }

    @PostMapping
    public ResponseEntity<ShiftResponse> create(
        @AuthenticationPrincipal UserDetails p,
        @Valid @RequestBody ShiftRequest req
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rosterService.create(uid(p), req));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ShiftResponse> update(
        @AuthenticationPrincipal UserDetails p,
        @PathVariable UUID id,
        @Valid @RequestBody ShiftRequest req
    ) {
        return ResponseEntity.ok(rosterService.update(uid(p), id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserDetails p, @PathVariable UUID id) {
        rosterService.delete(uid(p), id);
        return ResponseEntity.noContent().build();
    }

    private UUID uid(UserDetails p) { return UUID.fromString(p.getUsername()); }
}
