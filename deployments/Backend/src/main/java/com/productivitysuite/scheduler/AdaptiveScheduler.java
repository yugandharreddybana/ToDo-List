package com.productivitysuite.scheduler;

import com.productivitysuite.entity.DailyPlan;
import com.productivitysuite.entity.Notification.NotificationType;
import com.productivitysuite.entity.Task;
import com.productivitysuite.entity.User;
import com.productivitysuite.repository.*;
import com.productivitysuite.service.AiReportService;
import com.productivitysuite.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.*;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdaptiveScheduler {
    private final TaskRepository tasks;
    private final GoalRepository goals;
    private final UserRepository users;
    private final DailyPlanRepository plans;
    private final NotificationService notifications;
    private final AiReportService reports;

    @Scheduled(cron = "0 */15 * * * *", zone = "UTC")
    public void checkUserSchedules() {
        Instant now = Instant.now();
        for (User user : users.findAll()) {
            if (!user.isNotificationsEnabled()) continue;
            try {
                ZoneId zone = ZoneId.of(user.getTimezone());
                ZonedDateTime local = now.atZone(zone);
                LocalDate today = local.toLocalDate();
                if (local.getHour() >= 8) sendDueToday(user, today, zone);
                if (local.getHour() >= 6 && local.getHour() < 21) suggestReplan(user, today, local.toLocalTime());
                if (local.getHour() >= 21) sendReport(user, "day", today, today, NotificationType.DAILY_SUMMARY);
                if (local.getHour() >= 8 && local.getDayOfWeek() == DayOfWeek.MONDAY) {
                    LocalDate end = today.minusDays(1);
                    sendReport(user, "week", end.minusDays(6), end, NotificationType.WEEKLY_SUMMARY);
                }
                if (local.getHour() >= 8 && today.getDayOfMonth() == 1) {
                    LocalDate end = today.minusDays(1);
                    sendReport(user, "month", end.withDayOfMonth(1), end, NotificationType.MONTHLY_SUMMARY);
                }
            } catch (Exception e) {
                log.warn("Scheduled productivity check failed for user {}: {}", user.getId(), e.getClass().getSimpleName());
            }
        }
    }

    private void sendDueToday(User user, LocalDate today, ZoneId zone) {
        List<Task> due = tasks.findDueBetween(user.getId(), today.atStartOfDay(zone).toInstant(), today.plusDays(1).atStartOfDay(zone).toInstant());
        if (!due.isEmpty()) notifications.pushOnce(user.getId(), NotificationType.TASK_DUE, "Tasks due today",
            due.size() + " task(s) due today. Review your plan and priorities.", "due:" + today);
    }

    private void suggestReplan(User user, LocalDate today, LocalTime current) {
        plans.findByUserIdAndPlanDateOrderByVersionDesc(user.getId(), today).stream()
            .filter(plan -> plan.getStatus() == DailyPlan.PlanStatus.APPROVED).findFirst().ifPresent(plan -> {
                boolean behind = plan.getItems().stream().anyMatch(item -> "task".equals(item.getItemType())
                    && item.getTask() != null && item.getEndTime().isBefore(current)
                    && item.getTask().getStatus() != Task.TaskStatus.DONE);
                if (behind) notifications.pushOnce(user.getId(), NotificationType.REPLAN_SUGGESTION,
                    "Your plan may need adjusting", "One or more planned tasks are running behind. Open Daily Plan to review and request a replan; nothing changes until you approve it.",
                    "behind:" + plan.getId());
            });
    }

    private void sendReport(User user, String label, LocalDate from, LocalDate to, NotificationType type) {
        try {
            String key = "report:" + label + ":" + to;
            if (notifications.existsKey(user.getId(), key)) return;
            String body = reports.generate(user.getId(), from, to);
            notifications.pushOnce(user.getId(), type, label.substring(0, 1).toUpperCase() + label.substring(1) + " productivity report", body, key);
        } catch (Exception e) {
            log.warn("Scheduled {} report failed for user {}: {}", label, user.getId(), e.getClass().getSimpleName());
        }
    }

    @Scheduled(cron = "0 5 2 * * *", zone = "UTC")
    public void processRecurringTasks() {
        for (Task task : tasks.findByRecurringTrueAndStatus(Task.TaskStatus.DONE)) {
            if (task.getDueDate() == null || task.getRecurrenceFreq() == null) continue;
            try {
                ZoneId zone = ZoneId.of(task.getUser().getTimezone());
                LocalDate due = task.getDueDate().atZone(zone).toLocalDate();
                int interval = task.getRecurrenceInterval() == null ? 1 : Math.max(1, task.getRecurrenceInterval());
                LocalDate next = switch (task.getRecurrenceFreq()) {
                    case DAILY -> due.plusDays(interval);
                    case WEEKLY -> due.plusWeeks(interval);
                    case MONTHLY -> due.plusMonths(interval);
                };
                if (next.isAfter(LocalDate.now(zone))) continue;
                Instant nextInstant = next.atStartOfDay(zone).toInstant();
                if (task.getRecurrenceEnd() != null && nextInstant.isAfter(task.getRecurrenceEnd())) continue;
                if (tasks.existsByUserIdAndParentTaskIdAndDueDate(task.getUser().getId(), task.getId(), nextInstant)) continue;
                tasks.save(Task.builder().user(task.getUser()).parentTask(task).title(task.getTitle())
                    .description(task.getDescription()).status(Task.TaskStatus.TODO).priority(task.getPriority())
                    .estimatedMinutes(task.getEstimatedMinutes()).difficulty(task.getDifficulty())
                    .energyRequirement(task.getEnergyRequirement()).confidentiality(task.getConfidentiality())
                    .environment(task.getEnvironment()).dueDate(nextInstant).tags(task.getTags())
                    .recurring(true).recurrenceFreq(task.getRecurrenceFreq()).recurrenceInterval(interval)
                    .recurrenceEnd(task.getRecurrenceEnd()).build());
            } catch (Exception e) { log.warn("Recurring task check failed for task {}", task.getId()); }
        }
    }

    @Scheduled(cron = "0 0 9 * * *", zone = "UTC")
    public void checkApproachingGoalDeadlines() {
        Instant now = Instant.now();
        goals.findApproachingDeadlines(now, now.plus(Duration.ofDays(7))).forEach(goal -> {
            long days = Math.max(0, Duration.between(now, goal.getTargetDate()).toDays());
            notifications.pushOnce(goal.getUser().getId(), NotificationType.GOAL_DEADLINE, "Goal deadline approaching",
                goal.getTitle() + " is due in " + days + " day(s).", "goal:" + goal.getId() + ":" + LocalDate.now(ZoneOffset.UTC));
        });
    }
}
