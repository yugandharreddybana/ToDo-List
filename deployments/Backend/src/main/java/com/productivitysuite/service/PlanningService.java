package com.productivitysuite.service;

import com.productivitysuite.dto.planning.*;
import com.productivitysuite.entity.*;
import com.productivitysuite.exception.ResourceNotFoundException;
import com.productivitysuite.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor @Transactional
public class PlanningService {
    private final DailyCommitmentRepository commitments;
    private final ProductivityEventRepository events;
    private final UserRepository users;

    @Transactional(readOnly = true)
    public List<CommitmentResponse> list(UUID userId) {
        return commitments.findByUserIdOrderByStartTime(userId).stream().map(this::toResponse).collect(Collectors.toList());
    }
    public CommitmentResponse create(UUID userId, CommitmentRequest req) {
        User user = users.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", userId));
        if (!req.getEndTime().isAfter(req.getStartTime())) throw new IllegalArgumentException("Commitment end time must be after start time");
        DailyCommitment c = DailyCommitment.builder().user(user).title(req.getTitle()).startTime(req.getStartTime()).endTime(req.getEndTime())
            .daysOfWeek(req.getDaysOfWeek()).recurring(req.isRecurring()).date(req.getDate()).flexible(req.isFlexible()).build();
        DailyCommitment saved = commitments.save(c);
        record(userId, "commitment.created", "daily_commitment", saved.getId(), Map.of());
        return toResponse(saved);
    }
    public CommitmentResponse update(UUID userId, UUID id, CommitmentRequest req) {
        DailyCommitment c = commitments.findByIdAndUserId(id, userId).orElseThrow(() -> new ResourceNotFoundException("Commitment", id));
        if (!req.getEndTime().isAfter(req.getStartTime())) throw new IllegalArgumentException("Commitment end time must be after start time");
        c.setTitle(req.getTitle()); c.setStartTime(req.getStartTime()); c.setEndTime(req.getEndTime()); c.setDaysOfWeek(req.getDaysOfWeek());
        c.setRecurring(req.isRecurring()); c.setDate(req.getDate()); c.setFlexible(req.isFlexible()); DailyCommitment saved=commitments.save(c);record(userId,"commitment.updated","daily_commitment",id,Map.of());return toResponse(saved);
    }
    public void delete(UUID userId, UUID id) {
        commitments.delete(commitments.findByIdAndUserId(id, userId).orElseThrow(() -> new ResourceNotFoundException("Commitment", id)));
        record(userId, "commitment.deleted", "daily_commitment", id, Map.of());
    }
    public void record(UUID userId, String type, String entityType, UUID entityId, Map<String,Object> payload) {
        User user = users.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", userId));
        events.save(ProductivityEvent.builder().user(user).eventType(type).entityType(entityType).entityId(entityId).payload(payload == null ? Map.of() : payload).build());
    }
    private CommitmentResponse toResponse(DailyCommitment c) { return CommitmentResponse.builder().id(c.getId()).title(c.getTitle()).startTime(c.getStartTime()).endTime(c.getEndTime()).daysOfWeek(c.getDaysOfWeek()).recurring(c.isRecurring()).date(c.getDate()).flexible(c.isFlexible()).build(); }
}
