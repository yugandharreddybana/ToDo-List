package com.productivitysuite.dto.roster;

import com.productivitysuite.entity.RosterShift.ShiftType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class ShiftRequest {
    @NotNull
    private LocalDate date;

    @NotNull
    private LocalTime startTime;

    @NotNull
    private LocalTime endTime;

    private ShiftType shiftType = ShiftType.DAY;

    @Size(max = 500)
    private String notes;
}
