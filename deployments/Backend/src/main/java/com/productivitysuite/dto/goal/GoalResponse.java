package com.productivitysuite.dto.goal;

import com.productivitysuite.entity.Goal.GoalCategory;
import com.productivitysuite.entity.Goal.GoalStatus;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class GoalResponse {
    private UUID id;
    private UUID userId;
    private String title;
    private GoalCategory category;
    private Instant targetDate;
    private int progress;
    private GoalStatus status;
    private String notes;
    private List<MilestoneResponse> milestones;
    private Instant createdAt;
    private Instant updatedAt;

    @Data @Builder
    public static class MilestoneResponse {
        private UUID id;
        private String title;
        private boolean completed;
        private Instant targetDate;
    }
}
