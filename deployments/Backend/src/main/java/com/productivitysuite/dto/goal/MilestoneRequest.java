package com.productivitysuite.dto.goal;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.Instant;

@Data
public class MilestoneRequest {
    @NotBlank @Size(max = 200)
    private String title;
    private Instant targetDate;
    private Boolean completed;
}
