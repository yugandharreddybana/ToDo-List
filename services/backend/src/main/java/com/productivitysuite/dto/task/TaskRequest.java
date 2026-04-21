package com.productivitysuite.dto.task;

import com.productivitysuite.entity.Task.TaskPriority;
import com.productivitysuite.entity.Task.TaskStatus;
import com.productivitysuite.entity.Task.RecurrenceFreq;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
public class TaskRequest {
    @NotBlank @Size(max = 200)
    private String title;

    @Size(max = 5000)
    private String description;

    private TaskStatus status = TaskStatus.TODO;
    private TaskPriority priority = TaskPriority.MEDIUM;
    private Instant dueDate;

    @Size(max = 20)
    private List<String> tags = List.of();

    private UUID parentTaskId;
    private int order = 0;
    private boolean recurring = false;
    private RecurrenceFreq recurrenceFreq;

    @Min(1) @Max(365)
    private Integer recurrenceInterval;
    private Instant recurrenceEnd;
}
