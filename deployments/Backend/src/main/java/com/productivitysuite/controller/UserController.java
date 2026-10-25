package com.productivitysuite.controller;

import com.productivitysuite.entity.User;
import com.productivitysuite.exception.ResourceNotFoundException;
import com.productivitysuite.repository.UserRepository;
import com.productivitysuite.service.PlanningService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.productivitysuite.exception.UnauthorizedException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PlanningService events;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal UserDetails principal) {
        User user = findUser(principal);
        return ResponseEntity.ok(UserResponse.from(user));
    }

    @PatchMapping("/me")
    public ResponseEntity<UserResponse> update(
        @AuthenticationPrincipal UserDetails principal,
        @Valid @RequestBody UpdateUserRequest req
    ) {
        User user = findUser(principal);
        if (req.getName() != null) user.setName(req.getName());
        if (req.getTimezone() != null) {
            try { java.time.ZoneId.of(req.getTimezone()); }
            catch (java.time.DateTimeException ex) { throw new IllegalArgumentException("Invalid timezone"); }
            user.setTimezone(req.getTimezone());
        }
        if (req.getAvatarUrl() != null) user.setAvatarUrl(req.getAvatarUrl());
        if (req.getNotificationsEnabled() != null) user.setNotificationsEnabled(req.getNotificationsEnabled());
        User saved = userRepository.save(user);
        events.record(saved.getId(), "user.profile.updated", "user", saved.getId(), java.util.Map.of());
        return ResponseEntity.ok(UserResponse.from(saved));
    }

    @PatchMapping("/me/password")
    public ResponseEntity<Void> changePassword(@AuthenticationPrincipal UserDetails principal, @Valid @RequestBody PasswordRequest request) {
        User user = findUser(principal);
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash()))
            throw new UnauthorizedException("Current password is incorrect");
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        events.record(user.getId(), "user.password.changed", "user", user.getId(), java.util.Map.of());
        return ResponseEntity.noContent().build();
    }

    @Data
    public static class PasswordRequest {
        @jakarta.validation.constraints.NotBlank private String currentPassword;
        @jakarta.validation.constraints.NotBlank @Size(min = 8, max = 128) private String newPassword;
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserDetails principal) {
        UUID id = UUID.fromString(principal.getUsername());
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private User findUser(UserDetails principal) {
        UUID id = UUID.fromString(principal.getUsername());
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    public record UserResponse(UUID id, String email, String name, String avatarUrl, String timezone, boolean notificationsEnabled) {
        static UserResponse from(User u) {
            return new UserResponse(u.getId(), u.getEmail(), u.getName(), u.getAvatarUrl(), u.getTimezone(), u.isNotificationsEnabled());
        }
    }

    @Data
    public static class UpdateUserRequest {
        @Size(min = 1, max = 80)
        private String name;
        @Size(max = 80)
        private String timezone;
        @Size(max = 512)
        private String avatarUrl;
        private Boolean notificationsEnabled;
    }
}
