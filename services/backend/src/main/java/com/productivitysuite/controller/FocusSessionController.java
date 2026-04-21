package com.productivitysuite.controller;

import com.productivitysuite.dto.session.*;
import com.productivitysuite.service.FocusSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/sessions")
@RequiredArgsConstructor
public class FocusSessionController {

    private final FocusSessionService sessionService;

    @GetMapping
    public ResponseEntity<List<SessionResponse>> list(@AuthenticationPrincipal UserDetails p) {
        return ResponseEntity.ok(sessionService.list(uid(p)));
    }

    @PostMapping
    public ResponseEntity<SessionResponse> create(
        @AuthenticationPrincipal UserDetails p,
        @Valid @RequestBody SessionRequest req
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sessionService.create(uid(p), req));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<SessionResponse> update(
        @AuthenticationPrincipal UserDetails p,
        @PathVariable UUID id,
        @Valid @RequestBody SessionRequest req
    ) {
        return ResponseEntity.ok(sessionService.update(uid(p), id, req));
    }

    private UUID uid(UserDetails p) { return UUID.fromString(p.getUsername()); }
}
