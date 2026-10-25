package com.productivitysuite.controller;

import com.productivitysuite.dto.NotificationResponse;
import com.productivitysuite.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> list(@AuthenticationPrincipal UserDetails p) {
        return ResponseEntity.ok(notificationService.list(uid(p)));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markRead(
        @AuthenticationPrincipal UserDetails p,
        @PathVariable UUID id
    ) {
        return ResponseEntity.ok(notificationService.markRead(uid(p), id));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllRead(@AuthenticationPrincipal UserDetails p) {
        notificationService.markAllRead(uid(p));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserDetails p, @PathVariable UUID id) {
        notificationService.delete(uid(p), id);
        return ResponseEntity.noContent().build();
    }

    private UUID uid(UserDetails p) { return UUID.fromString(p.getUsername()); }
}
