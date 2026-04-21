package com.productivitysuite.dto.auth;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class AuthResponse {
    private UUID userId;
    private String email;
    private String name;
    private String avatarUrl;
    private String timezone;
    private String accessToken;
    private String refreshToken;
    private Instant accessTokenExpiresAt;
}
