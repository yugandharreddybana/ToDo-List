package com.productivitysuite.service;

import com.productivitysuite.dto.PagedResponse;
import com.productivitysuite.dto.task.*;
import com.productivitysuite.entity.*;
import com.productivitysuite.entity.Task.*;
import com.productivitysuite.exception.ResourceNotFoundException;
import com.productivitysuite.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final SubtaskRepository subtaskRepository;
    private final TaskCommentRepository commentRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PagedResponse<TaskResponse> list(UUID userId, TaskStatus status, TaskPriority priority,
                                             String tag, String search, int page, int limit) {
        var pageable = PageRequest.of(page - 1, limit);
        var p = taskRepository.findFiltered(userId, status, priority, tag, search, pageable);
        return PagedResponse.from(p, this::toResponse);
    }

    public TaskResponse create(UUID userId, TaskRequest req) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        Task parent = req.getParentTaskId() == null ? null :
            taskRepository.findByIdAndUserId(req.getParentTaskId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent task", req.getParentTaskId()));

        Task task = Task.builder()
            .user(user)
            .title(req.getTitle())
            .description(req.getDescription())
            .status(req.getStatus())
            .priority(req.getPriority())
            .dueDate(req.getDueDate())
            .tags(req.getTags() == null ? new String[0] : req.getTags().toArray(new String[0]))
            .parentTask(parent)
            .order(req.getOrder())
            .recurring(req.isRecurring())
            .recurrenceFreq(req.getRecurrenceFreq())
            .recurrenceInterval(req.getRecurrenceInterval())
            .recurrenceEnd(req.getRecurrenceEnd())
            .build();

        return toResponse(taskRepository.save(task));
    }

    @Transactional(readOnly = true)
    public TaskResponse get(UUID userId, UUID taskId) {
        return toResponse(findOwned(userId, taskId));
    }

    public TaskResponse update(UUID userId, UUID taskId, TaskRequest req) {
        Task task = findOwned(userId, taskId);
        if (req.getTitle() != null) task.setTitle(req.getTitle());
        if (req.getDescription() != null) task.setDescription(req.getDescription());
        if (req.getStatus() != null) task.setStatus(req.getStatus());
        if (req.getPriority() != null) task.setPriority(req.getPriority());
        if (req.getDueDate() != null) task.setDueDate(req.getDueDate());
        if (req.getTags() != null) task.setTags(req.getTags().toArray(new String[0]));
        task.setOrder(req.getOrder());
        task.setRecurring(req.isRecurring());
        task.setRecurrenceFreq(req.getRecurrenceFreq());
        task.setRecurrenceInterval(req.getRecurrenceInterval());
        task.setRecurrenceEnd(req.getRecurrenceEnd());
        return toResponse(taskRepository.save(task));
    }

    public void delete(UUID userId, UUID taskId) {
        Task task = findOwned(userId, taskId);
        taskRepository.delete(task);
    }

    public TaskResponse addSubtask(UUID userId, UUID taskId, SubtaskRequest req) {
        Task task = findOwned(userId, taskId);
        Subtask sub = Subtask.builder().task(task).title(req.getTitle()).order(req.getOrder()).build();
        task.getSubtasks().add(sub);
        return toResponse(taskRepository.save(task));
    }

    public TaskResponse updateSubtask(UUID userId, UUID taskId, UUID subId, SubtaskRequest req) {
        findOwned(userId, taskId);
        Subtask sub = subtaskRepository.findByIdAndTaskId(subId, taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Subtask", subId));
        if (req.getTitle() != null) sub.setTitle(req.getTitle());
        sub.setOrder(req.getOrder());
        subtaskRepository.save(sub);
        return get(userId, taskId);
    }

    public TaskResponse addComment(UUID userId, UUID taskId, CommentRequest req) {
        Task task = findOwned(userId, taskId);
        User user = userRepository.findById(userId).orElseThrow();
        TaskComment comment = TaskComment.builder().task(task).user(user).content(req.getContent()).build();
        task.getComments().add(comment);
        return toResponse(taskRepository.save(task));
    }

    public void bulkUpdate(UUID userId, BulkUpdateRequest req) {
        for (UUID id : req.getIds()) {
            try {
                update(userId, id, req.getPatch());
            } catch (ResourceNotFoundException ignored) { /* skip non-owned */ }
        }
    }

    private Task findOwned(UUID userId, UUID taskId) {
        return taskRepository.findByIdAndUserId(taskId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));
    }

    private TaskResponse toResponse(Task t) {
        return TaskResponse.builder()
            .id(t.getId())
            .userId(t.getUser().getId())
            .title(t.getTitle())
            .description(t.getDescription())
            .status(t.getStatus())
            .priority(t.getPriority())
            .dueDate(t.getDueDate())
            .tags(t.getTags() == null ? List.of() : List.of(t.getTags()))
            .parentTaskId(t.getParentTask() == null ? null : t.getParentTask().getId())
            .order(t.getOrder())
            .recurring(t.isRecurring())
            .recurrenceFreq(t.getRecurrenceFreq())
            .recurrenceInterval(t.getRecurrenceInterval())
            .recurrenceEnd(t.getRecurrenceEnd())
            .subtasks(t.getSubtasks().stream().map(s ->
                TaskResponse.SubtaskResponse.builder()
                    .id(s.getId()).title(s.getTitle())
                    .completed(s.isCompleted()).order(s.getOrder()).build()
            ).collect(Collectors.toList()))
            .comments(t.getComments().stream().map(c ->
                TaskResponse.CommentResponse.builder()
                    .id(c.getId()).userId(c.getUser().getId())
                    .content(c.getContent()).createdAt(c.getCreatedAt()).build()
            ).collect(Collectors.toList()))
            .createdAt(t.getCreatedAt())
            .updatedAt(t.getUpdatedAt())
            .build();
    }
}
