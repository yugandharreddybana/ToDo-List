package com.productivitysuite.scheduler;

import com.productivitysuite.entity.Task;
import com.productivitysuite.entity.User;
import com.productivitysuite.entity.DailyPlan;
import com.productivitysuite.entity.PlanItem;
import com.productivitysuite.entity.Notification.NotificationType;
import com.productivitysuite.repository.*;
import com.productivitysuite.service.AiReportService;
import com.productivitysuite.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.Instant;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AdaptiveSchedulerTest {
    private final TaskRepository tasks = mock(TaskRepository.class);
    private final GoalRepository goals = mock(GoalRepository.class);
    private final UserRepository users = mock(UserRepository.class);
    private final DailyPlanRepository plans = mock(DailyPlanRepository.class);
    private final NotificationService notifications = mock(NotificationService.class);
    private final AiReportService reports = mock(AiReportService.class);
    private final AdaptiveScheduler scheduler = new AdaptiveScheduler(tasks, goals, users, plans, notifications, reports);

    @Test
    void recurringTaskCopiesPlanningAttributesAndLinksToSource() {
        User user = User.builder().timezone("UTC").build();
        user.setId(UUID.randomUUID());
        Task source = Task.builder().user(user).title("Repeat work").status(Task.TaskStatus.DONE)
            .priority(Task.TaskPriority.HIGH).estimatedMinutes(45).difficulty(Task.TaskDifficulty.HARD)
            .energyRequirement(Task.EnergyRequirement.HIGH).confidentiality(Task.Confidentiality.PERSONAL)
            .dueDate(LocalDate.now(ZoneOffset.UTC).minusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant())
            .recurring(true).recurrenceFreq(Task.RecurrenceFreq.DAILY).recurrenceInterval(1).build();
        source.setId(UUID.randomUUID());
        when(tasks.findByRecurringTrueAndStatus(Task.TaskStatus.DONE)).thenReturn(List.of(source));

        scheduler.processRecurringTasks();

        ArgumentCaptor<Task> capture = ArgumentCaptor.forClass(Task.class);
        verify(tasks).save(capture.capture());
        Task next = capture.getValue();
        assertEquals(source, next.getParentTask());
        assertEquals(Task.TaskStatus.TODO, next.getStatus());
        assertEquals(45, next.getEstimatedMinutes());
        assertEquals(Task.TaskDifficulty.HARD, next.getDifficulty());
        assertEquals(LocalDate.now(ZoneOffset.UTC).atStartOfDay(ZoneOffset.UTC).toInstant(), next.getDueDate());
    }

    @Test
    void recurringTaskDoesNotDuplicateExistingInstance() {
        User user = User.builder().timezone("UTC").build();
        user.setId(UUID.randomUUID());
        Task source = Task.builder().user(user).title("Repeat work").status(Task.TaskStatus.DONE)
            .dueDate(LocalDate.now(ZoneOffset.UTC).minusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant())
            .recurring(true).recurrenceFreq(Task.RecurrenceFreq.DAILY).build();
        source.setId(UUID.randomUUID());
        when(tasks.findByRecurringTrueAndStatus(Task.TaskStatus.DONE)).thenReturn(List.of(source));
        when(tasks.existsByUserIdAndParentTaskIdAndDueDate(eq(user.getId()), eq(source.getId()), any())).thenReturn(true);

        scheduler.processRecurringTasks();

        verify(tasks, never()).save(any());
    }

    @Test
    void overdueApprovedTaskSuggestsReplanWithoutChangingPlan() {
        int offsetHours = 12 - Instant.now().atZone(ZoneOffset.UTC).getHour();
        ZoneOffset zone = ZoneOffset.ofHours(offsetHours);
        User user = User.builder().timezone(zone.getId()).build();
        user.setId(UUID.randomUUID());
        LocalDate today = LocalDate.now(zone);
        Task unfinished = Task.builder().user(user).title("Unfinished").status(Task.TaskStatus.TODO).build();
        PlanItem item = PlanItem.builder().task(unfinished).title("Unfinished").itemType("task")
            .startTime(LocalTime.of(10, 0)).endTime(LocalTime.of(11, 0)).build();
        DailyPlan plan = DailyPlan.builder().user(user).planDate(today).status(DailyPlan.PlanStatus.APPROVED)
            .items(List.of(item)).windowStart(LocalTime.of(6, 0)).windowEnd(LocalTime.of(21, 0)).build();
        plan.setId(UUID.randomUUID());
        when(users.findAll()).thenReturn(List.of(user));
        when(plans.findByUserIdAndPlanDateOrderByVersionDesc(user.getId(), today)).thenReturn(List.of(plan));

        scheduler.checkUserSchedules();

        verify(notifications).pushOnce(eq(user.getId()), eq(NotificationType.REPLAN_SUGGESTION), anyString(), anyString(), eq("behind:" + plan.getId()));
        assertEquals(DailyPlan.PlanStatus.APPROVED, plan.getStatus());
    }
}
