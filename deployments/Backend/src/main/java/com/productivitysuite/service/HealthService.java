package com.productivitysuite.service;

import com.productivitysuite.dto.health.*;
import com.productivitysuite.entity.*;
import com.productivitysuite.exception.ResourceNotFoundException;
import com.productivitysuite.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.time.LocalDate;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class HealthService {

    private final HealthLogRepository logRepo;
    private final HabitRepository habitRepo;
    private final HabitLogRepository habitLogRepo;
    private final UserRepository userRepository;
    private final PlanningService events;

    @Transactional(readOnly = true)
    public List<HealthLogResponse> listLogs(UUID userId) {
        return logRepo.findByUserIdOrderByLogDateDesc(userId)
            .stream().map(this::toLogResponse).collect(Collectors.toList());
    }

    public HealthLogResponse upsertLog(UUID userId, HealthLogRequest req) {
        User user = userRepository.findById(userId).orElseThrow();
        HealthLog log = logRepo.findByUserIdAndLogDate(userId, req.getDate())
            .orElse(HealthLog.builder().user(user).logDate(req.getDate()).build());
        log.setMood(req.getMood());
        log.setSleepHours(req.getSleepHours());
        log.setSleepQuality(req.getSleepQuality());
        log.setWaterIntakeLiters(req.getWaterIntakeLiters());
        log.setWeightKg(req.getWeightKg());
        log.setStepsCount(req.getStepsCount());
        log.setCalories(req.getCalories());
        log.setNotes(req.getNotes());
        HealthLog saved = logRepo.save(log);
        events.record(userId, "health.logged", "health_log", saved.getId(), java.util.Map.of("date", saved.getLogDate().toString()));
        return toLogResponse(saved);
    }

    public void deleteLog(UUID userId, UUID id) {
        HealthLog log = logRepo.findByIdAndUserId(id, userId).orElseThrow(() -> new ResourceNotFoundException("Health log", id));
        logRepo.delete(log);
        events.record(userId, "health.deleted", "health_log", id, java.util.Map.of());
    }

    public HealthLogResponse updateLog(UUID userId, UUID id, HealthLogRequest request) {
        HealthLog log = logRepo.findByIdAndUserId(id, userId).orElseThrow(() -> new ResourceNotFoundException("Health log", id));
        if (!log.getLogDate().equals(request.getDate())) throw new IllegalArgumentException("Health log date cannot change");
        return upsertLog(userId, request);
    }

    @Transactional(readOnly = true)
    public List<HabitResponse> listHabits(UUID userId) {
        return habitRepo.findByUserIdOrderByCreatedAtAsc(userId).stream().map(HabitResponse::from).toList();
    }

    public HabitResponse createHabit(UUID userId, HabitRequest req) {
        User user = userRepository.findById(userId).orElseThrow();
        Habit saved = habitRepo.save(Habit.builder()
            .user(user).name(req.getName()).frequency(req.getFrequency())
            .color(req.getColor()).icon(req.getIcon()).build());
        events.record(userId, "habit.created", "habit", saved.getId(), java.util.Map.of());
        return HabitResponse.from(saved);
    }

    public HabitResponse updateHabit(UUID userId, UUID id, HabitRequest req) {
        Habit habit = habitRepo.findByIdAndUserId(id, userId).orElseThrow(() -> new ResourceNotFoundException("Habit", id));
        habit.setName(req.getName()); habit.setFrequency(req.getFrequency()); habit.setColor(req.getColor()); habit.setIcon(req.getIcon());
        Habit saved = habitRepo.save(habit);
        events.record(userId, "habit.updated", "habit", id, java.util.Map.of());
        return HabitResponse.from(saved);
    }

    public void deleteHabit(UUID userId, UUID id) {
        habitRepo.delete(habitRepo.findByIdAndUserId(id, userId).orElseThrow(() -> new ResourceNotFoundException("Habit", id)));
        events.record(userId, "habit.deleted", "habit", id, java.util.Map.of());
    }

    @Transactional(readOnly = true)
    public List<HabitLogResponse> listHabitLogs(UUID userId, LocalDate from, LocalDate to) {
        return habitLogRepo.findByHabitUserIdAndLogDateBetween(userId, from, to).stream().map(HabitLogResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<HabitLogResponse> listHabitLogs(UUID userId, UUID habitId) {
        habitRepo.findByIdAndUserId(habitId, userId).orElseThrow(() -> new ResourceNotFoundException("Habit", habitId));
        return habitLogRepo.findByHabitIdOrderByLogDateDesc(habitId).stream().map(HabitLogResponse::from).toList();
    }

    public HabitLogResponse logHabit(UUID userId, UUID habitId, HabitLogRequest req) {
        habitRepo.findByIdAndUserId(habitId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Habit", habitId));
        HabitLog hl = habitLogRepo.findByHabitIdAndLogDate(habitId, req.getDate())
            .orElseGet(() -> {
                Habit h = habitRepo.findById(habitId).orElseThrow();
                return HabitLog.builder().habit(h).logDate(req.getDate()).build();
            });
        hl.setCompleted(req.isCompleted());
        HabitLog saved = habitLogRepo.save(hl);
        events.record(userId, "habit.logged", "habit_log", saved.getId(), java.util.Map.of("completed", saved.isCompleted()));
        return HabitLogResponse.from(saved);
    }

    private HealthLogResponse toLogResponse(HealthLog l) {
        return HealthLogResponse.builder()
            .id(l.getId()).userId(l.getUser().getId()).date(l.getLogDate())
            .mood(l.getMood()).sleepHours(l.getSleepHours()).sleepQuality(l.getSleepQuality())
            .waterIntakeLiters(l.getWaterIntakeLiters()).weightKg(l.getWeightKg())
            .stepsCount(l.getStepsCount()).calories(l.getCalories())
            .notes(l.getNotes()).createdAt(l.getCreatedAt()).build();
    }
}
