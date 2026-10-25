package com.productivitysuite.service;

import com.productivitysuite.dto.session.*;
import com.productivitysuite.entity.FocusSession;
import com.productivitysuite.entity.Task;
import com.productivitysuite.entity.User;
import com.productivitysuite.exception.ResourceNotFoundException;
import com.productivitysuite.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.time.Duration;
import java.time.Instant;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FocusSessionService {

    private final FocusSessionRepository sessionRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final PlanningService planningService;

    @Transactional(readOnly = true)
    public List<SessionResponse> list(UUID userId) {
        return sessionRepository.findByUserIdOrderByStartTimeDesc(userId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public SessionResponse create(UUID userId, SessionRequest req) {
        if (req.getEndTime() != null || req.getStartTime().isAfter(Instant.now().plusSeconds(60)) || req.getStartTime().isBefore(Instant.now().minusSeconds(120)))
            throw new IllegalArgumentException("A new session must start now and end later");
        if (sessionRepository.existsByUserIdAndEndTimeIsNull(userId))
            throw new IllegalArgumentException("Finish or reset the active session before starting another");
        User user = userRepository.findById(userId).orElseThrow();
        Task task = req.getTaskId() == null ? null :
            taskRepository.findByIdAndUserId(req.getTaskId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", req.getTaskId()));

        FocusSession session = FocusSession.builder()
            .user(user).task(task).startTime(req.getStartTime())
            .endTime(req.getEndTime()).durationMinutes(req.getDurationMinutes())
            .type(req.getType()).build();

        FocusSession saved = sessionRepository.save(session);
        planningService.record(userId, "focus.started", "focus_session", saved.getId(), Map.of("type", saved.getType().name(), "durationMinutes", saved.getDurationMinutes()));
        return toResponse(saved);
    }

    public SessionResponse get(UUID userId, UUID sessionId) {
        return toResponse(sessionRepository.findByIdAndUserId(sessionId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Session", sessionId)));
    }

    public SessionResponse update(UUID userId, UUID sessionId, SessionUpdateRequest req) {
        FocusSession session = sessionRepository.findByIdAndUserId(sessionId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Session", sessionId));
        if (session.getEndTime() != null) throw new IllegalArgumentException("Session has already ended");
        if (req.getEndTime().isBefore(session.getStartTime()) || req.getEndTime().isAfter(Instant.now().plusSeconds(60)))
            throw new IllegalArgumentException("Invalid session end time");
        int elapsed = Math.toIntExact(Duration.between(session.getStartTime(), req.getEndTime()).getSeconds());
        int actual = req.getActualSeconds() == null ? elapsed : req.getActualSeconds();
        if (actual > elapsed + 5) throw new IllegalArgumentException("Actual focus time cannot exceed elapsed time");
        session.setEndTime(req.getEndTime());
        session.setActualSeconds(actual);
        session.setCompleted(req.getCompleted());
        session.setNotes(req.getNotes());
        FocusSession saved = sessionRepository.save(session);
        planningService.record(userId, "focus.ended", "focus_session", saved.getId(), Map.of("actualSeconds", actual, "completed", saved.isCompleted()));
        return toResponse(saved);
    }

    public void delete(UUID userId, UUID sessionId) {
        FocusSession session = sessionRepository.findByIdAndUserId(sessionId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Session", sessionId));
        sessionRepository.delete(session);
        planningService.record(userId, "focus.deleted", "focus_session", sessionId, Map.of());
    }

    private SessionResponse toResponse(FocusSession s) {
        return SessionResponse.builder()
            .id(s.getId()).userId(s.getUser().getId())
            .taskId(s.getTask() == null ? null : s.getTask().getId())
            .startTime(s.getStartTime()).endTime(s.getEndTime())
            .durationMinutes(s.getDurationMinutes()).type(s.getType())
            .actualSeconds(s.getActualSeconds()).completed(s.isCompleted()).notes(s.getNotes())
            .createdAt(s.getCreatedAt()).build();
    }
}
