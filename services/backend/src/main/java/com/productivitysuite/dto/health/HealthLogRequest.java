package com.productivitysuite.dto.health;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class HealthLogRequest {
    @NotNull
    private LocalDate date;

    @Min(1) @Max(5)
    private Short mood;

    @DecimalMin("0") @DecimalMax("24")
    private BigDecimal sleepHours;

    @Min(1) @Max(5)
    private Short sleepQuality;

    @DecimalMin("0")
    private BigDecimal waterIntakeLiters;

    @DecimalMin("0")
    private BigDecimal weightKg;

    @Size(max = 2000)
    private String notes;
}
