package com.productivitysuite.controller;

import com.productivitysuite.dto.planning.*;
import com.productivitysuite.service.PlanningService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/planning") @RequiredArgsConstructor
public class PlanningController {
    private final PlanningService planning;
    @GetMapping("/commitments") public List<CommitmentResponse> list(@AuthenticationPrincipal UserDetails p) { return planning.list(uid(p)); }
    @PostMapping("/commitments") public ResponseEntity<CommitmentResponse> create(@AuthenticationPrincipal UserDetails p, @Valid @RequestBody CommitmentRequest r) { return ResponseEntity.status(HttpStatus.CREATED).body(planning.create(uid(p), r)); }
    @PutMapping("/commitments/{id}") public CommitmentResponse update(@AuthenticationPrincipal UserDetails p, @PathVariable UUID id, @Valid @RequestBody CommitmentRequest r) { return planning.update(uid(p), id, r); }
    @DeleteMapping("/commitments/{id}") public ResponseEntity<Void> delete(@AuthenticationPrincipal UserDetails p, @PathVariable UUID id) { planning.delete(uid(p), id); return ResponseEntity.noContent().build(); }
    private UUID uid(UserDetails p) { return UUID.fromString(p.getUsername()); }
}
