package com.productivitysuite.dto.goal;

import com.productivitysuite.entity.Goal.GoalCategory;
import com.productivitysuite.entity.Goal.GoalStatus;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.Instant;

@Data
public class GoalPatchRequest {
    @Size(min = 1, max = 200) private String title;
    private GoalCategory category;
    private Instant targetDate;
    @Min(0) @Max(100) private Integer progress;
    private GoalStatus status;
    @Size(max = 5000) private String notes;
}
