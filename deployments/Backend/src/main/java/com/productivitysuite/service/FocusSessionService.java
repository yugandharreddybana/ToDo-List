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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FocusSessionService {

    private final FocusSessionRepository sessionRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<SessionResponse> list(UUID userId) {
        return sessionRepository.findByUserIdOrderByStartTimeDesc(userId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public SessionResponse create(UUID userId, SessionRequest req) {
        User user = userRepository.findById(userId).orElseThrow();
        Task task = req.getTaskId() == null ? null :
            taskRepository.findByIdAndUserId(req.getTaskId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", req.getTaskId()));

        FocusSession session = FocusSession.builder()
            .user(user).task(task).startTime(req.getStartTime())
            .endTime(req.getEndTime()).durationMinutes(req.getDurationMinutes())
            .type(req.getType()).build();

        return toResponse(sessionRepository.save(session));
    }

    public SessionResponse update(UUID userId, UUID sessionId, SessionRequest req) {
        FocusSession session = sessionRepository.findByIdAndUserId(sessionId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Session", sessionId));
        if (req.getEndTime() != null) session.setEndTime(req.getEndTime());
        session.setDurationMinutes(req.getDurationMinutes());
        return toResponse(sessionRepository.save(session));
    }

    private SessionResponse toResponse(FocusSession s) {
        return SessionResponse.builder()
            .id(s.getId()).userId(s.getUser().getId())
            .taskId(s.getTask() == null ? null : s.getTask().getId())
            .startTime(s.getStartTime()).endTime(s.getEndTime())
            .durationMinutes(s.getDurationMinutes()).type(s.getType())
            .createdAt(s.getCreatedAt()).build();
    }
}
