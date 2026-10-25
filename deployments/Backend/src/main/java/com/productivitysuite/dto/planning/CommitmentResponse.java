package com.productivitysuite.dto.planning;
import lombok.Builder;
import lombok.Data;
import java.time.*;
import java.util.UUID;

@Data @Builder
public class CommitmentResponse {
    private UUID id; private String title; private LocalTime startTime; private LocalTime endTime;
    private short[] daysOfWeek; private boolean recurring; private LocalDate date; private boolean flexible;
}
