package com.productivitysuite.dto.health;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class HabitLogRequest {
    @NotNull
    private LocalDate date;
    private boolean completed = true;
}
