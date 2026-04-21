package com.productivitysuite.dto.analytics;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class AnalyticsSummaryResponse {
    private int totalTasks;
    private int completedTasks;
    private double completionRate;
    private int totalFocusMinutes;
    private int pomodoroSessions;
    private int activeGoals;
    private double avgGoalProgress;
    private int careerApplications;
    private List<DailyCount> taskCompletionByDay;
    private List<DailyCount> focusMinutesByDay;

    @Data @Builder
    public static class DailyCount {
        private String date; // YYYY-MM-DD
        private int count;
    }
}
