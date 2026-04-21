package com.productivitysuite.scheduler;

import com.productivitysuite.entity.Notification;
import com.productivitysuite.entity.Task;
import com.productivitysuite.entity.Task.TaskStatus;
import com.productivitysuite.repository.*;
import com.productivitysuite.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProductivityScheduler {

    private final TaskRepository taskRepository;
    private final GoalRepository goalRepository;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final NotificationService notificationService;

    /** Daily at 07:00 UTC: notify users of tasks due today */
    @Scheduled(cron = "0 0 7 * * *", zone = "UTC")
    @Transactional
    public void sendDueTodayReminders() {
        log.info("[scheduler] Running due-today reminders");
        Instant dayStart = Instant.now().truncatedTo(java.time.temporal.ChronoUnit.DAYS);
        Instant dayEnd = dayStart.plus(1, java.time.temporal.ChronoUnit.DAYS);

        userRepository.findAll().forEach(user -> {
            List<Task> dueTasks = taskRepository.findDueBetween(user.getId(), dayStart, dayEnd);
            if (!dueTasks.isEmpty()) {
                String titles = dueTasks.stream()
                    .map(Task::getTitle).limit(3).reduce((a, b) -> a + ", " + b).orElse("");
                notificationService.push(
                    user.getId(),
                    Notification.NotificationType.TASK_DUE,
                    "Tasks due today",
                    dueTasks.size() + " task(s) due today: " + titles
                );
            }
        });
    }

    /** Daily at 02:00 UTC: process recurring task instances */
    @Scheduled(cron = "0 0 2 * * *", zone = "UTC")
    @Transactional
    public void processRecurringTasks() {
        log.info("[scheduler] Processing recurring tasks");
        LocalDate today = LocalDate.now(ZoneOffset.UTC);

        taskRepository.findAll().stream()
            .filter(t -> t.isRecurring() && t.getStatus() == TaskStatus.DONE)
            .forEach(t -> {
                if (t.getRecurrenceFreq() == null) return;
                LocalDate dueLocal = t.getDueDate() == null ? null :
                    t.getDueDate().atZone(ZoneOffset.UTC).toLocalDate();
                if (dueLocal == null) return;

                LocalDate nextDue = switch (t.getRecurrenceFreq()) {
                    case DAILY   -> dueLocal.plusDays(t.getRecurrenceInterval() == null ? 1 : t.getRecurrenceInterval());
                    case WEEKLY  -> dueLocal.plusWeeks(t.getRecurrenceInterval() == null ? 1 : t.getRecurrenceInterval());
                    case MONTHLY -> dueLocal.plusMonths(t.getRecurrenceInterval() == null ? 1 : t.getRecurrenceInterval());
                };

                if (!nextDue.isAfter(today)) {
                    Task clone = Task.builder()
                        .user(t.getUser()).title(t.getTitle()).description(t.getDescription())
                        .status(TaskStatus.TODO).priority(t.getPriority())
                        .dueDate(nextDue.atStartOfDay(ZoneOffset.UTC).toInstant())
                        .tags(t.getTags()).recurring(false).build();
                    taskRepository.save(clone);
                    log.debug("Created recurring instance for task {}", t.getId());
                }
            });
    }

    /** Weekly on Monday at 08:00 UTC: send productivity summary */
    @Scheduled(cron = "0 0 8 * * MON", zone = "UTC")
    @Transactional
    public void weeklyProductivitySummary() {
        log.info("[scheduler] Sending weekly productivity summaries");
        userRepository.findAll().forEach(user -> {
            long done = taskRepository.findFiltered(
                user.getId(), TaskStatus.DONE, null, null, null,
                org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE)
            ).getTotalElements();
            notificationService.push(
                user.getId(),
                Notification.NotificationType.WEEKLY_SUMMARY,
                "Weekly Summary",
                "You completed " + done + " tasks this week. Keep it up!"
            );
        });
    }

    /** Hourly: check for goals with deadlines within 7 days */
    @Scheduled(cron = "0 0 * * * *", zone = "UTC")
    @Transactional
    public void checkApproachingGoalDeadlines() {
        Instant now = Instant.now();
        Instant sevenDaysOut = now.plus(7, java.time.temporal.ChronoUnit.DAYS);
        goalRepository.findApproachingDeadlines(now, sevenDaysOut).forEach(goal -> {
            long daysLeft = Duration.between(now, goal.getTargetDate()).toDays();
            notificationService.push(
                goal.getUser().getId(),
                Notification.NotificationType.GOAL_DEADLINE,
                "Goal deadline approaching",
                "\"" + goal.getTitle() + "\" is due in " + daysLeft + " day(s)."
            );
        });
    }

    /** Daily: purge expired refresh tokens */
    @Scheduled(cron = "0 30 3 * * *", zone = "UTC")
    @Transactional
    public void purgeExpiredRefreshTokens() {
        log.info("[scheduler] Purging expired refresh tokens");
        refreshTokenRepository.deleteExpired(Instant.now());
    }
}
