package com.productivitysuite.dto.session;

import com.productivitysuite.entity.FocusSession.SessionType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class SessionRequest {
    private UUID taskId;

    @NotNull
    private Instant startTime;

    private Instant endTime;

    @Min(1) @Max(720)
    private int durationMinutes;

    private SessionType type = SessionType.POMODORO;
}
