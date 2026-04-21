package com.productivitysuite.dto.auth;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank @Email
    private String email;

    @NotBlank @Size(min = 8, max = 128)
    private String password;

    @NotBlank @Size(min = 1, max = 80)
    private String name;

    @Size(max = 80)
    private String timezone = "UTC";
}
