package com.productivitysuite.dto.health;

import com.productivitysuite.entity.Habit;
import java.time.Instant;
import java.util.UUID;

public record HabitResponse(UUID id, String name, Habit.HabitFrequency frequency, String color,
                            String icon, int streak, Instant createdAt) {
    public static HabitResponse from(Habit habit) {
        return new HabitResponse(habit.getId(), habit.getName(), habit.getFrequency(), habit.getColor(), habit.getIcon(), habit.getStreak(), habit.getCreatedAt());
    }
}
