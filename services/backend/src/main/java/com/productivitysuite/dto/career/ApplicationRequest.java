package com.productivitysuite.dto.career;

import com.productivitysuite.entity.CareerApplication.CareerStage;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
public class ApplicationRequest {
    @NotBlank @Size(max = 200)
    private String company;

    @NotBlank @Size(max = 200)
    private String role;

    private CareerStage status = CareerStage.SAVED;
    private Instant appliedDate;

    @DecimalMin("0") private BigDecimal salaryMin;
    @DecimalMin("0") private BigDecimal salaryMax;

    @Size(min = 3, max = 3)
    private String currency = "USD";

    @Size(max = 512)
    private String url;

    @Size(max = 5000)
    private String notes;

    @Size(max = 120)
    private String contactName;

    @Email @Size(max = 255)
    private String contactEmail;

    private Instant nextFollowUp;
}
