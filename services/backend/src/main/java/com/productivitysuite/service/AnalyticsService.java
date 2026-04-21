package com.productivitysuite.service;

import com.productivitysuite.dto.analytics.*;
import com.productivitysuite.entity.Task.TaskStatus;
import com.productivitysuite.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final TaskRepository taskRepo;
    private final FocusSessionRepository sessionRepo;
    private final GoalRepository goalRepo;
    private final CareerApplicationRepository careerRepo;

    public AnalyticsSummaryResponse summary(UUID userId, String period) {
        Instant from = periodStart(period);
        Instant now = Instant.now();

        var allTasks = taskRepo.findFiltered(userId, null, null, null, null,
            org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE)).getContent();

        long total = allTasks.size();
        long done = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
        double completionRate = total == 0 ? 0 : Math.round(done * 1000.0 / total) / 10.0;

        int focusMinutes = sessionRepo.sumMinutesBetween(userId, from, now);
        var sessions = sessionRepo.findByUserIdOrderByStartTimeDesc(userId);
        long pomodoroCount = sessions.stream()
            .filter(s -> s.getStartTime().isAfter(from))
            .filter(s -> s.getType() == com.productivitysuite.entity.FocusSession.SessionType.POMODORO)
            .count();

        var goals = goalRepo.findByUserIdOrderByCreatedAtDesc(userId);
        long activeGoals = goals.stream()
            .filter(g -> g.getStatus() == com.productivitysuite.entity.Goal.GoalStatus.ACTIVE).count();
        double avgProgress = goals.isEmpty() ? 0 :
            goals.stream().mapToInt(com.productivitysuite.entity.Goal::getProgress).average().orElse(0);

        long careerApps = careerRepo.findByUserIdOrderByCreatedAtDesc(userId).size();

        // Daily counts for period
        DateTimeFormatter fmt = DateTimeFormatter.ISO_LOCAL_DATE;
        Map<String, Integer> completionByDay = allTasks.stream()
            .filter(t -> t.getStatus() == TaskStatus.DONE && t.getUpdatedAt().isAfter(from))
            .collect(Collectors.groupingBy(
                t -> LocalDate.ofInstant(t.getUpdatedAt(), ZoneOffset.UTC).format(fmt),
                Collectors.collectingAndThen(Collectors.counting(), Long::intValue)));

        List<AnalyticsSummaryResponse.DailyCount> taskByDay = completionByDay.entrySet().stream()
            .map(e -> AnalyticsSummaryResponse.DailyCount.builder().date(e.getKey()).count(e.getValue()).build())
            .sorted(Comparator.comparing(AnalyticsSummaryResponse.DailyCount::getDate))
            .collect(Collectors.toList());

        return AnalyticsSummaryResponse.builder()
            .totalTasks((int) total).completedTasks((int) done).completionRate(completionRate)
            .totalFocusMinutes(focusMinutes).pomodoroSessions((int) pomodoroCount)
            .activeGoals((int) activeGoals).avgGoalProgress(avgProgress)
            .careerApplications((int) careerApps)
            .taskCompletionByDay(taskByDay).focusMinutesByDay(List.of())
            .build();
    }

    public HeatmapResponse heatmap(UUID userId) {
        Instant yearAgo = Instant.now().minus(365, java.time.temporal.ChronoUnit.DAYS);
        var tasks = taskRepo.findFiltered(userId, TaskStatus.DONE, null, null, null,
            org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE)).getContent();
        DateTimeFormatter fmt = DateTimeFormatter.ISO_LOCAL_DATE;
        Map<String, Long> countByDay = tasks.stream()
            .filter(t -> t.getUpdatedAt().isAfter(yearAgo))
            .collect(Collectors.groupingBy(
                t -> LocalDate.ofInstant(t.getUpdatedAt(), ZoneOffset.UTC).format(fmt),
                Collectors.counting()));

        long max = countByDay.values().stream().mapToLong(Long::longValue).max().orElse(1);
        List<HeatmapResponse.HeatmapCell> cells = countByDay.entrySet().stream()
            .map(e -> {
                int val = e.getValue().intValue();
                int level = (int) Math.ceil(val * 4.0 / max);
                return HeatmapResponse.HeatmapCell.builder().date(e.getKey()).value(val).level(level).build();
            })
            .sorted(Comparator.comparing(HeatmapResponse.HeatmapCell::getDate))
            .collect(Collectors.toList());

        return HeatmapResponse.builder().cells(cells).build();
    }

    private Instant periodStart(String period) {
        return switch (period) {
            case "month" -> Instant.now().minus(30, java.time.temporal.ChronoUnit.DAYS);
            case "year"  -> Instant.now().minus(365, java.time.temporal.ChronoUnit.DAYS);
            default      -> Instant.now().minus(7, java.time.temporal.ChronoUnit.DAYS);
        };
    }
}
