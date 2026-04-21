package com.productivitysuite.dto.health;

import com.productivitysuite.entity.Habit.HabitFrequency;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class HabitRequest {
    @NotBlank @Size(max = 120)
    private String name;

    private HabitFrequency frequency = HabitFrequency.DAILY;

    @Pattern(regexp = "#[0-9A-Fa-f]{6}")
    private String color = "#5B9BD5";

    @Size(max = 40)
    private String icon = "activity";
}
