package com.productivitysuite.dto.task;

import com.productivitysuite.entity.Task;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class TaskResponse {
    private UUID id;
    private UUID userId;
    private String title;
    private String description;
    private Task.TaskStatus status;
    private Task.TaskPriority priority;
    private Instant dueDate;
    private List<String> tags;
    private UUID parentTaskId;
    private int order;
    private boolean recurring;
    private Task.RecurrenceFreq recurrenceFreq;
    private Integer recurrenceInterval;
    private Instant recurrenceEnd;
    private List<SubtaskResponse> subtasks;
    private List<CommentResponse> comments;
    private Instant createdAt;
    private Instant updatedAt;

    @Data @Builder
    public static class SubtaskResponse {
        private UUID id;
        private String title;
        private boolean completed;
        private int order;
    }

    @Data @Builder
    public static class CommentResponse {
        private UUID id;
        private UUID userId;
        private String content;
        private Instant createdAt;
    }
}
