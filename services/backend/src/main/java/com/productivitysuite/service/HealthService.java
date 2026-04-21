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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class HealthService {

    private final HealthLogRepository logRepo;
    private final HabitRepository habitRepo;
    private final HabitLogRepository habitLogRepo;
    private final UserRepository userRepository;

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
        log.setNotes(req.getNotes());
        return toLogResponse(logRepo.save(log));
    }

    @Transactional(readOnly = true)
    public List<Habit> listHabits(UUID userId) {
        return habitRepo.findByUserIdOrderByCreatedAtAsc(userId);
    }

    public Habit createHabit(UUID userId, HabitRequest req) {
        User user = userRepository.findById(userId).orElseThrow();
        return habitRepo.save(Habit.builder()
            .user(user).name(req.getName()).frequency(req.getFrequency())
            .color(req.getColor()).icon(req.getIcon()).build());
    }

    public HabitLog logHabit(UUID userId, UUID habitId, HabitLogRequest req) {
        habitRepo.findByIdAndUserId(habitId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Habit", habitId));
        HabitLog hl = habitLogRepo.findByHabitIdAndLogDate(habitId, req.getDate())
            .orElseGet(() -> {
                Habit h = habitRepo.findById(habitId).orElseThrow();
                return HabitLog.builder().habit(h).logDate(req.getDate()).build();
            });
        hl.setCompleted(req.isCompleted());
        return habitLogRepo.save(hl);
    }

    private HealthLogResponse toLogResponse(HealthLog l) {
        return HealthLogResponse.builder()
            .id(l.getId()).userId(l.getUser().getId()).date(l.getLogDate())
            .mood(l.getMood()).sleepHours(l.getSleepHours()).sleepQuality(l.getSleepQuality())
            .waterIntakeLiters(l.getWaterIntakeLiters()).weightKg(l.getWeightKg())
            .notes(l.getNotes()).createdAt(l.getCreatedAt()).build();
    }
}
