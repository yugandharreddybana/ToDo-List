package com.productivitysuite.dto.career;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.UUID;

@Data
public class ContactRequest {
    private UUID applicationId;

    @NotBlank @Size(max = 120)
    private String name;

    @Email @Size(max = 255)
    private String email;

    @Size(max = 512)
    private String linkedinUrl;

    @Size(max = 120)
    private String role;

    @Size(max = 2000)
    private String notes;
}
