package com.productivitysuite.dto.career;

import com.productivitysuite.entity.CareerApplication.CareerStage;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class ApplicationResponse {
    private UUID id;
    private UUID userId;
    private String company;
    private String role;
    private CareerStage status;
    private Instant appliedDate;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String currency;
    private String url;
    private String notes;
    private String contactName;
    private String contactEmail;
    private Instant nextFollowUp;
    private Instant createdAt;
    private Instant updatedAt;
}
