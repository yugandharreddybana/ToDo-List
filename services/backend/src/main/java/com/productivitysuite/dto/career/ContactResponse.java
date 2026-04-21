package com.productivitysuite.dto.career;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class ContactResponse {
    private UUID id;
    private UUID userId;
    private UUID applicationId;
    private String name;
    private String email;
    private String linkedinUrl;
    private String role;
    private String notes;
    private Instant createdAt;
}
