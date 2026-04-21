package com.productivitysuite.dto.session;

import com.productivitysuite.entity.FocusSession.SessionType;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class SessionResponse {
    private UUID id;
    private UUID userId;
    private UUID taskId;
    private Instant startTime;
    private Instant endTime;
    private int durationMinutes;
    private SessionType type;
    private Instant createdAt;
}
