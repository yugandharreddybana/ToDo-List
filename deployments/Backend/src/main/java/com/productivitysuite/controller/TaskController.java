package com.productivitysuite.controller;

import com.productivitysuite.dto.PagedResponse;
import com.productivitysuite.dto.task.*;
import com.productivitysuite.entity.Task.*;
import com.productivitysuite.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<PagedResponse<TaskResponse>> list(
        @AuthenticationPrincipal UserDetails principal,
        @RequestParam(required = false) TaskStatus status,
        @RequestParam(required = false) TaskPriority priority,
        @RequestParam(required = false) String tag,
        @RequestParam(required = false) String search,
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "25") int limit
    ) {
        return ResponseEntity.ok(
            taskService.list(uid(principal), status, priority, tag, search, page, limit));
    }

    @PostMapping
    public ResponseEntity<TaskResponse> create(
        @AuthenticationPrincipal UserDetails principal,
        @Valid @RequestBody TaskRequest req
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.create(uid(principal), req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> get(
        @AuthenticationPrincipal UserDetails principal,
        @PathVariable UUID id
    ) {
        return ResponseEntity.ok(taskService.get(uid(principal), id));
    }

    @RequestMapping(value = "/{id}", method = {RequestMethod.PATCH, RequestMethod.PUT})
    public ResponseEntity<TaskResponse> update(
        @AuthenticationPrincipal UserDetails principal,
        @PathVariable UUID id,
        @Valid @RequestBody TaskPatchRequest req
    ) {
        return ResponseEntity.ok(taskService.update(uid(principal), id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
        @AuthenticationPrincipal UserDetails principal,
        @PathVariable UUID id
    ) {
        taskService.delete(uid(principal), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/subtasks")
    public ResponseEntity<TaskResponse> addSubtask(
        @AuthenticationPrincipal UserDetails principal,
        @PathVariable UUID id,
        @Valid @RequestBody SubtaskRequest req
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.addSubtask(uid(principal), id, req));
    }

    @GetMapping("/{id}/subtasks")
    public List<TaskResponse.SubtaskResponse> subtasks(@AuthenticationPrincipal UserDetails principal, @PathVariable UUID id) {
        return taskService.listSubtasks(uid(principal), id);
    }

    @PatchMapping("/{id}/subtasks/{subId}/completed")
    public TaskResponse setSubtaskCompleted(@AuthenticationPrincipal UserDetails principal, @PathVariable UUID id,
                                             @PathVariable UUID subId, @RequestBody Map<String, Boolean> body) {
        if (!body.containsKey("completed") || body.get("completed") == null) throw new IllegalArgumentException("completed is required");
        return taskService.setSubtaskCompleted(uid(principal), id, subId, body.get("completed"));
    }

    @DeleteMapping("/{id}/subtasks/{subId}")
    public ResponseEntity<Void> deleteSubtask(@AuthenticationPrincipal UserDetails principal, @PathVariable UUID id, @PathVariable UUID subId) {
        taskService.deleteSubtask(uid(principal), id, subId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/subtasks/{subId}")
    public ResponseEntity<TaskResponse> updateSubtask(
        @AuthenticationPrincipal UserDetails principal,
        @PathVariable UUID id,
        @PathVariable UUID subId,
        @Valid @RequestBody SubtaskRequest req
    ) {
        return ResponseEntity.ok(taskService.updateSubtask(uid(principal), id, subId, req));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<TaskResponse> addComment(
        @AuthenticationPrincipal UserDetails principal,
        @PathVariable UUID id,
        @Valid @RequestBody CommentRequest req
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.addComment(uid(principal), id, req));
    }

    @GetMapping("/{id}/comments")
    public List<TaskResponse.CommentResponse> comments(@AuthenticationPrincipal UserDetails principal, @PathVariable UUID id) {
        return taskService.listComments(uid(principal), id);
    }

    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@AuthenticationPrincipal UserDetails principal, @PathVariable UUID id, @PathVariable UUID commentId) {
        taskService.deleteComment(uid(principal), id, commentId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reorder")
    public ResponseEntity<Void> reorder(@AuthenticationPrincipal UserDetails principal, @RequestBody Map<String, List<UUID>> body) {
        taskService.reorder(uid(principal), body.get("orderedIds"));
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/bulk-update")
    public ResponseEntity<Void> bulkUpdate(
        @AuthenticationPrincipal UserDetails principal,
        @Valid @RequestBody BulkUpdateRequest req
    ) {
        taskService.bulkUpdate(uid(principal), req);
        return ResponseEntity.noContent().build();
    }

    private UUID uid(UserDetails p) { return UUID.fromString(p.getUsername()); }
}
