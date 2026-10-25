package com.productivitysuite.dto.health;

import com.productivitysuite.entity.HabitLog;
import java.time.LocalDate;
import java.util.UUID;

public record HabitLogResponse(UUID id, UUID habitId, LocalDate logDate, boolean completed) {
    public static HabitLogResponse from(HabitLog log) {
        return new HabitLogResponse(log.getId(), log.getHabit().getId(), log.getLogDate(), log.isCompleted());
    }
}
