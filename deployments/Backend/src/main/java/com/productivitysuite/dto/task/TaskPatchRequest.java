package com.productivitysuite.dto.task;

import com.productivitysuite.entity.Task.*;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
public class TaskPatchRequest {
    @Size(min = 1, max = 200) private String title;
    @Size(max = 5000) private String description;
    private TaskStatus status;
    private TaskPriority priority;
    @Min(1) @Max(1440) private Integer estimatedMinutes;
    private TaskDifficulty difficulty;
    private EnergyRequirement energyRequirement;
    private Confidentiality confidentiality;
    @Size(max = 120) private String environment;
    private Instant dueDate;
    @Size(max = 20) private List<String> tags;
    private Integer order;
    private Boolean recurring;
    private RecurrenceFreq recurrenceFreq;
    @Min(1) @Max(365) private Integer recurrenceInterval;
    private Instant recurrenceEnd;
}
