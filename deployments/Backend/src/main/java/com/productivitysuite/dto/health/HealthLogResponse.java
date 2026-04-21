package com.productivitysuite.dto.health;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class HealthLogResponse {
    private UUID id;
    private UUID userId;
    private LocalDate date;
    private Short mood;
    private BigDecimal sleepHours;
    private Short sleepQuality;
    private BigDecimal waterIntakeLiters;
    private BigDecimal weightKg;
    private String notes;
    private Instant createdAt;
}
