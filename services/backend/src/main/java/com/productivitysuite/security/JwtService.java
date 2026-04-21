package com.productivitysuite.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
@Slf4j
public class JwtService {

    private static final int MIN_SECRET_BYTES = 32; // 256 bits — required by RFC 7518 §3.2

    private final SecretKey key;
    private final long accessTtlSeconds;

    public JwtService(
        @Value("${app.jwt.secret}") String secret,
        @Value("${app.jwt.access-ttl-seconds:900}") long accessTtlSeconds
    ) {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < MIN_SECRET_BYTES) {
            throw new IllegalArgumentException(
                "app.jwt.secret must be at least " + MIN_SECRET_BYTES + " bytes (256 bits) " +
                "to satisfy RFC 7518 §3.2 for HMAC-SHA algorithms. " +
                "Current length: " + keyBytes.length + " bytes. " +
                "Set the APP_JWT_SECRET environment variable to a value of 32+ characters."
            );
        }
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.accessTtlSeconds = accessTtlSeconds;
    }

    public String generateAccessToken(UUID userId, String email) {
        Instant now = Instant.now();
        return Jwts.builder()
            .subject(userId.toString())
            .claim("email", email)
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plusSeconds(accessTtlSeconds)))
            .signWith(key)
            .compact();
    }

    public Claims validateAndParse(String token) {
        return Jwts.parser().verifyWith(key).build()
            .parseSignedClaims(token).getPayload();
    }

    public UUID extractUserId(String token) {
        return UUID.fromString(validateAndParse(token).getSubject());
    }

    public Instant accessTokenExpiresAt() {
        return Instant.now().plusSeconds(accessTtlSeconds);
    }

    public boolean isValid(String token) {
        try {
            validateAndParse(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Invalid JWT: {}", e.getMessage());
            return false;
        }
    }
}
