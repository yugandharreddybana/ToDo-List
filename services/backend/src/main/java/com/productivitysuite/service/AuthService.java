package com.productivitysuite.service;

import com.productivitysuite.dto.auth.*;
import com.productivitysuite.entity.*;
import com.productivitysuite.exception.*;
import com.productivitysuite.repository.*;
import com.productivitysuite.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.jwt.refresh-ttl-seconds:604800}")
    private long refreshTtlSeconds;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ConflictException("Email already registered: " + req.getEmail());
        }
        User user = User.builder()
            .email(req.getEmail())
            .passwordHash(passwordEncoder.encode(req.getPassword()))
            .name(req.getName())
            .timezone(req.getTimezone())
            .build();
        user = userRepository.save(user);
        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
            .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));
        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid credentials");
        }
        return buildAuthResponse(user);
    }

    public AuthResponse refresh(String rawRefreshToken) {
        String hash = hash(rawRefreshToken);
        RefreshToken stored = refreshTokenRepository.findByTokenHash(hash)
            .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));
        if (stored.getExpiresAt().isBefore(Instant.now())) {
            refreshTokenRepository.delete(stored);
            throw new UnauthorizedException("Refresh token expired");
        }
        refreshTokenRepository.delete(stored);
        return buildAuthResponse(stored.getUser());
    }

    public void logout(UUID userId) {
        refreshTokenRepository.deleteAllByUserId(userId);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail());
        String rawRefresh = UUID.randomUUID().toString();
        RefreshToken refreshToken = RefreshToken.builder()
            .user(user)
            .tokenHash(hash(rawRefresh))
            .expiresAt(Instant.now().plusSeconds(refreshTtlSeconds))
            .build();
        refreshTokenRepository.save(refreshToken);

        return AuthResponse.builder()
            .userId(user.getId())
            .email(user.getEmail())
            .name(user.getName())
            .avatarUrl(user.getAvatarUrl())
            .timezone(user.getTimezone())
            .accessToken(accessToken)
            .refreshToken(rawRefresh)
            .accessTokenExpiresAt(jwtService.accessTokenExpiresAt())
            .build();
    }

    private String hash(String value) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(value.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(digest);
        } catch (Exception e) {
            throw new RuntimeException("Hashing failed", e);
        }
    }
}
