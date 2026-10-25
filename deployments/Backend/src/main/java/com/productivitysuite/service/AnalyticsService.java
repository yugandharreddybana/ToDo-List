package com.productivitysuite.service;

import com.productivitysuite.dto.analytics.*;
import com.productivitysuite.entity.Task.TaskStatus;
import com.productivitysuite.entity.FocusSession;
import com.productivitysuite.entity.Task;
import com.productivitysuite.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.temporal.TemporalAdjusters;
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
    private final UserRepository userRepo;
    private final ProductivityEventRepository eventRepo;

    public AnalyticsSummaryResponse summary(UUID userId, String period, LocalDate customFrom, LocalDate customTo) {
        ZoneId zone = ZoneId.of(userRepo.findById(userId).orElseThrow().getTimezone());
        LocalDate today = LocalDate.now(zone);
        LocalDate start = switch (period) {
            case "day" -> today;
            case "week" -> today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            case "month" -> today.withDayOfMonth(1);
            case "quarter" -> today.withMonth(((today.getMonthValue() - 1) / 3) * 3 + 1).withDayOfMonth(1);
            case "year" -> today.withDayOfYear(1);
            case "custom" -> customFrom;
            default -> throw new IllegalArgumentException("Unsupported analytics period");
        };
        LocalDate end = period.equals("custom") ? customTo : today;
        if (start == null || end == null || end.isBefore(start) || end.isAfter(today) || start.plusYears(2).isBefore(end))
            throw new IllegalArgumentException("Invalid analytics date range");
        Instant from = start.atStartOfDay(zone).toInstant();
        Instant to = end.plusDays(1).atStartOfDay(zone).toInstant();
        List<Task> touched = taskRepo.findByUserIdAndUpdatedAtGreaterThanEqualAndUpdatedAtLessThan(userId, from, to);
        List<FocusSession> sessions = sessionRepo.findByUserIdAndStartTimeGreaterThanEqualAndStartTimeLessThan(userId, from, to);
        var completions = eventRepo.findByUserIdAndEventTypeAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(userId, "task.completed", from, to);
        Set<UUID> activeTaskIds = new HashSet<>();
        touched.forEach(t -> activeTaskIds.add(t.getId()));
        completions.forEach(e -> { if (e.getEntityId() != null) activeTaskIds.add(e.getEntityId()); });
        int done = completions.size();
        double completionRate = activeTaskIds.isEmpty() ? 0 : Math.min(100, Math.round(done * 1000.0 / activeTaskIds.size()) / 10.0);
        int focusMinutes = (int) Math.round(sessions.stream().filter(s -> s.getType() == FocusSession.SessionType.POMODORO || s.getType() == FocusSession.SessionType.CUSTOM)
            .mapToInt(FocusSession::getActualSeconds).sum() / 60.0);
        int pomodoros = (int) sessions.stream().filter(s -> s.isCompleted() && s.getType() == FocusSession.SessionType.POMODORO).count();
        var goals = goalRepo.findByUserIdOrderByCreatedAtDesc(userId);
        int activeGoals = (int) goals.stream().filter(g -> g.getStatus() == com.productivitysuite.entity.Goal.GoalStatus.ACTIVE).count();
        double avgProgress = goals.isEmpty() ? 0 : goals.stream().mapToInt(com.productivitysuite.entity.Goal::getProgress).average().orElse(0);
        Map<String, Integer> taskCounts = new HashMap<>();
        for (var event : completions)
            taskCounts.merge(LocalDate.ofInstant(event.getCreatedAt(), zone).toString(), 1, Integer::sum);
        Map<String, Integer> focusSeconds = new HashMap<>();
        Map<UUID, List<FocusSession>> byTask = new HashMap<>();
        for (FocusSession session : sessions) {
            if (session.getType() != FocusSession.SessionType.POMODORO && session.getType() != FocusSession.SessionType.CUSTOM) continue;
            focusSeconds.merge(LocalDate.ofInstant(session.getStartTime(), zone).toString(), session.getActualSeconds(), Integer::sum);
            if (session.getTask() != null) byTask.computeIfAbsent(session.getTask().getId(), ignored -> new ArrayList<>()).add(session);
        }
        List<AnalyticsSummaryResponse.DailyCount> taskByDay = new ArrayList<>();
        List<AnalyticsSummaryResponse.DailyCount> focusByDay = new ArrayList<>();
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            String key = date.toString();
            taskByDay.add(AnalyticsSummaryResponse.DailyCount.builder().date(key).count(taskCounts.getOrDefault(key, 0)).build());
            focusByDay.add(AnalyticsSummaryResponse.DailyCount.builder().date(key).count((int) Math.round(focusSeconds.getOrDefault(key, 0) / 60.0)).build());
        }
        List<AnalyticsSummaryResponse.TaskFocus> focusByTask = byTask.entrySet().stream().map(entry -> {
            List<FocusSession> group = entry.getValue();
            return AnalyticsSummaryResponse.TaskFocus.builder().taskId(entry.getKey().toString())
                .title(group.get(0).getTask().getTitle()).sessions(group.size())
                .actualMinutes((int) Math.round(group.stream().mapToInt(FocusSession::getActualSeconds).sum() / 60.0)).build();
        }).sorted(Comparator.comparingInt(AnalyticsSummaryResponse.TaskFocus::getActualMinutes).reversed()).toList();
        return AnalyticsSummaryResponse.builder().fromDate(start.toString()).toDate(end.toString())
            .totalTasks(activeTaskIds.size()).completedTasks(done).completionRate(completionRate)
            .totalFocusMinutes(focusMinutes).pomodoroSessions(pomodoros).activeGoals(activeGoals)
            .avgGoalProgress(avgProgress).taskCompletionByDay(taskByDay).focusMinutesByDay(focusByDay)
            .focusByTask(focusByTask).build();
    }

    public HeatmapResponse heatmap(UUID userId) {
        Instant yearAgo = Instant.now().minus(365, java.time.temporal.ChronoUnit.DAYS);
        var completions = eventRepo.findByUserIdAndEventTypeAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(userId, "task.completed", yearAgo, Instant.now());
        DateTimeFormatter fmt = DateTimeFormatter.ISO_LOCAL_DATE;
        ZoneId zone = ZoneId.of(userRepo.findById(userId).orElseThrow().getTimezone());
        Map<String, Long> countByDay = completions.stream()
            .collect(Collectors.groupingBy(
                event -> LocalDate.ofInstant(event.getCreatedAt(), zone).format(fmt),
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

}
