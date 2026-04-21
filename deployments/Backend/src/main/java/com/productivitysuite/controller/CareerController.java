package com.productivitysuite.controller;

import com.productivitysuite.dto.career.*;
import com.productivitysuite.service.CareerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/career")
@RequiredArgsConstructor
public class CareerController {

    private final CareerService careerService;

    @GetMapping("/applications")
    public ResponseEntity<List<ApplicationResponse>> listApps(@AuthenticationPrincipal UserDetails p) {
        return ResponseEntity.ok(careerService.listApplications(uid(p)));
    }

    @PostMapping("/applications")
    public ResponseEntity<ApplicationResponse> createApp(
        @AuthenticationPrincipal UserDetails p,
        @Valid @RequestBody ApplicationRequest req
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(careerService.createApplication(uid(p), req));
    }

    @PatchMapping("/applications/{id}")
    public ResponseEntity<ApplicationResponse> updateApp(
        @AuthenticationPrincipal UserDetails p,
        @PathVariable UUID id,
        @Valid @RequestBody ApplicationRequest req
    ) {
        return ResponseEntity.ok(careerService.updateApplication(uid(p), id, req));
    }

    @DeleteMapping("/applications/{id}")
    public ResponseEntity<Void> deleteApp(@AuthenticationPrincipal UserDetails p, @PathVariable UUID id) {
        careerService.deleteApplication(uid(p), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/contacts")
    public ResponseEntity<List<ContactResponse>> listContacts(@AuthenticationPrincipal UserDetails p) {
        return ResponseEntity.ok(careerService.listContacts(uid(p)));
    }

    @PostMapping("/contacts")
    public ResponseEntity<ContactResponse> createContact(
        @AuthenticationPrincipal UserDetails p,
        @Valid @RequestBody ContactRequest req
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(careerService.createContact(uid(p), req));
    }

    private UUID uid(UserDetails p) { return UUID.fromString(p.getUsername()); }
}
