package com.productivitysuite.controller;

import com.productivitysuite.entity.User;
import com.productivitysuite.exception.ResourceNotFoundException;
import com.productivitysuite.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.RequiredArgsConstructor;
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
        if (req.getTimezone() != null) user.setTimezone(req.getTimezone());
        if (req.getAvatarUrl() != null) user.setAvatarUrl(req.getAvatarUrl());
        return ResponseEntity.ok(UserResponse.from(userRepository.save(user)));
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

    public record UserResponse(UUID id, String email, String name, String avatarUrl, String timezone) {
        static UserResponse from(User u) {
            return new UserResponse(u.getId(), u.getEmail(), u.getName(), u.getAvatarUrl(), u.getTimezone());
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
    }
}
