package com.productivitysuite.dto.roster;

import com.productivitysuite.entity.RosterShift.ShiftType;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
public class ShiftResponse {
    private UUID id;
    private UUID userId;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private ShiftType shiftType;
    private String notes;
    private Instant createdAt;
}
