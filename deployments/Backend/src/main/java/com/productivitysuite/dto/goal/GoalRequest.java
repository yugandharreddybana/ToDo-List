package com.productivitysuite.dto.goal;

import com.productivitysuite.entity.Goal.GoalCategory;
import com.productivitysuite.entity.Goal.GoalStatus;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.Instant;

@Data
public class GoalRequest {
    @NotBlank @Size(max = 200)
    private String title;

    @NotNull
    private GoalCategory category;

    private Instant targetDate;

    @Min(0) @Max(100)
    private int progress = 0;

    private GoalStatus status = GoalStatus.ACTIVE;

    @Size(max = 5000)
    private String notes;
}
