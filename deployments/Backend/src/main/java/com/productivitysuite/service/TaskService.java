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
import java.util.Map;
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
    private final PlanningService planningService;

    @Transactional(readOnly = true)
    public PagedResponse<TaskResponse> list(UUID userId, TaskStatus status, TaskPriority priority,
                                             String tag, String search, int page, int limit) {
        var pageable = PageRequest.of(page - 1, limit);
        var p = taskRepository.findFiltered(userId, status == null ? null : status.name(), priority == null ? null : priority.name(), tag, search, pageable);
        return PagedResponse.from(p, this::toResponse);
    }

    public TaskResponse create(UUID userId, TaskRequest req) {
        if (req.isRecurring() && (req.getDueDate() == null || req.getRecurrenceFreq() == null))
            throw new IllegalArgumentException("Recurring tasks require a due date and recurrence frequency");
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
            .estimatedMinutes(req.getEstimatedMinutes())
            .difficulty(req.getDifficulty())
            .energyRequirement(req.getEnergyRequirement())
            .confidentiality(req.getConfidentiality())
            .environment(req.getEnvironment())
            .dueDate(req.getDueDate())
            .tags(req.getTags() == null ? new String[0] : req.getTags().toArray(new String[0]))
            .parentTask(parent)
            .order(req.getOrder())
            .recurring(req.isRecurring())
            .recurrenceFreq(req.getRecurrenceFreq())
            .recurrenceInterval(req.getRecurrenceInterval())
            .recurrenceEnd(req.getRecurrenceEnd())
            .build();

        Task saved = taskRepository.save(task);
        planningService.record(userId, "task.created", "task", saved.getId(), Map.of("priority", saved.getPriority().name()));
        if (saved.getStatus() == TaskStatus.DONE) planningService.record(userId, "task.completed", "task", saved.getId(), Map.of());
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public TaskResponse get(UUID userId, UUID taskId) {
        return toResponse(findOwned(userId, taskId));
    }

    public TaskResponse update(UUID userId, UUID taskId, TaskPatchRequest req) {
        Task task = findOwned(userId, taskId);
        TaskStatus previousStatus = task.getStatus();
        if (req.getTitle() != null) task.setTitle(req.getTitle());
        if (req.getDescription() != null) task.setDescription(req.getDescription());
        if (req.getStatus() != null) task.setStatus(req.getStatus());
        if (req.getPriority() != null) task.setPriority(req.getPriority());
        if (req.getEstimatedMinutes() != null) task.setEstimatedMinutes(req.getEstimatedMinutes());
        if (req.getDifficulty() != null) task.setDifficulty(req.getDifficulty());
        if (req.getEnergyRequirement() != null) task.setEnergyRequirement(req.getEnergyRequirement());
        if (req.getConfidentiality() != null) task.setConfidentiality(req.getConfidentiality());
        if (req.getEnvironment() != null) task.setEnvironment(req.getEnvironment());
        if (req.getDueDate() != null) task.setDueDate(req.getDueDate());
        if (req.getTags() != null) task.setTags(req.getTags().toArray(new String[0]));
        if (req.getOrder() != null) task.setOrder(req.getOrder());
        if (req.getRecurring() != null) task.setRecurring(req.getRecurring());
        if (req.getRecurrenceFreq() != null) task.setRecurrenceFreq(req.getRecurrenceFreq());
        if (req.getRecurrenceInterval() != null) task.setRecurrenceInterval(req.getRecurrenceInterval());
        if (req.getRecurrenceEnd() != null) task.setRecurrenceEnd(req.getRecurrenceEnd());
        if (task.isRecurring() && (task.getDueDate() == null || task.getRecurrenceFreq() == null))
            throw new IllegalArgumentException("Recurring tasks require a due date and recurrence frequency");
        Task saved = taskRepository.save(task);
        planningService.record(userId, "task.updated", "task", saved.getId(), Map.of("status", saved.getStatus().name()));
        if (previousStatus != TaskStatus.DONE && saved.getStatus() == TaskStatus.DONE)
            planningService.record(userId, "task.completed", "task", saved.getId(), Map.of());
        return toResponse(saved);
    }

    public void delete(UUID userId, UUID taskId) {
        Task task = findOwned(userId, taskId);
        taskRepository.delete(task);
        planningService.record(userId, "task.deleted", "task", taskId, Map.of());
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

    public TaskResponse setSubtaskCompleted(UUID userId, UUID taskId, UUID subId, boolean completed) {
        findOwned(userId, taskId);
        Subtask sub = subtaskRepository.findByIdAndTaskId(subId, taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Subtask", subId));
        sub.setCompleted(completed);
        subtaskRepository.save(sub);
        planningService.record(userId, "subtask.updated", "subtask", subId, Map.of("completed", completed));
        return get(userId, taskId);
    }

    public void deleteSubtask(UUID userId, UUID taskId, UUID subId) {
        findOwned(userId, taskId);
        Subtask sub = subtaskRepository.findByIdAndTaskId(subId, taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Subtask", subId));
        subtaskRepository.delete(sub);
    }

    public List<TaskResponse.SubtaskResponse> listSubtasks(UUID userId, UUID taskId) {
        return get(userId, taskId).getSubtasks();
    }

    public List<TaskResponse.CommentResponse> listComments(UUID userId, UUID taskId) {
        return get(userId, taskId).getComments();
    }

    public void deleteComment(UUID userId, UUID taskId, UUID commentId) {
        findOwned(userId, taskId);
        TaskComment comment = commentRepository.findById(commentId)
            .filter(c -> c.getTask().getId().equals(taskId))
            .orElseThrow(() -> new ResourceNotFoundException("Comment", commentId));
        commentRepository.delete(comment);
    }

    public void reorder(UUID userId, List<UUID> orderedIds) {
        if (orderedIds == null || orderedIds.size() > 500 || orderedIds.size() != new java.util.HashSet<>(orderedIds).size())
            throw new IllegalArgumentException("Invalid task order");
        for (int i = 0; i < orderedIds.size(); i++) {
            Task task = findOwned(userId, orderedIds.get(i));
            task.setOrder(i);
        }
        planningService.record(userId, "tasks.reordered", "task", null, Map.of("count", orderedIds.size()));
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
                TaskPatchRequest patch = new TaskPatchRequest();
                patch.setStatus(req.getPatch().getStatus());
                patch.setPriority(req.getPatch().getPriority());
                patch.setTitle(req.getPatch().getTitle());
                update(userId, id, patch);
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
            .estimatedMinutes(t.getEstimatedMinutes())
            .difficulty(t.getDifficulty())
            .energyRequirement(t.getEnergyRequirement())
            .confidentiality(t.getConfidentiality())
            .environment(t.getEnvironment())
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
