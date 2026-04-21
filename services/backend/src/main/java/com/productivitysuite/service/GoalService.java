package com.productivitysuite.service;

import com.productivitysuite.dto.goal.*;
import com.productivitysuite.entity.*;
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
public class GoalService {

    private final GoalRepository goalRepository;
    private final GoalMilestoneRepository milestoneRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<GoalResponse> list(UUID userId) {
        return goalRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public GoalResponse create(UUID userId, GoalRequest req) {
        User user = userRepository.findById(userId).orElseThrow();
        Goal goal = Goal.builder()
            .user(user).title(req.getTitle()).category(req.getCategory())
            .targetDate(req.getTargetDate()).progress(req.getProgress())
            .status(req.getStatus()).notes(req.getNotes()).build();
        return toResponse(goalRepository.save(goal));
    }

    @Transactional(readOnly = true)
    public GoalResponse get(UUID userId, UUID goalId) {
        return toResponse(findOwned(userId, goalId));
    }

    public GoalResponse update(UUID userId, UUID goalId, GoalRequest req) {
        Goal goal = findOwned(userId, goalId);
        if (req.getTitle() != null) goal.setTitle(req.getTitle());
        if (req.getCategory() != null) goal.setCategory(req.getCategory());
        if (req.getTargetDate() != null) goal.setTargetDate(req.getTargetDate());
        goal.setProgress(req.getProgress());
        if (req.getStatus() != null) goal.setStatus(req.getStatus());
        if (req.getNotes() != null) goal.setNotes(req.getNotes());
        return toResponse(goalRepository.save(goal));
    }

    public void delete(UUID userId, UUID goalId) {
        goalRepository.delete(findOwned(userId, goalId));
    }

    public GoalResponse addMilestone(UUID userId, UUID goalId, MilestoneRequest req) {
        Goal goal = findOwned(userId, goalId);
        GoalMilestone m = GoalMilestone.builder()
            .goal(goal).title(req.getTitle()).targetDate(req.getTargetDate()).build();
        goal.getMilestones().add(m);
        return toResponse(goalRepository.save(goal));
    }

    public GoalResponse updateMilestone(UUID userId, UUID goalId, UUID mId, MilestoneRequest req) {
        findOwned(userId, goalId);
        GoalMilestone m = milestoneRepository.findByIdAndGoalId(mId, goalId)
            .orElseThrow(() -> new ResourceNotFoundException("Milestone", mId));
        if (req.getTitle() != null) m.setTitle(req.getTitle());
        if (req.getCompleted() != null) m.setCompleted(req.getCompleted());
        if (req.getTargetDate() != null) m.setTargetDate(req.getTargetDate());
        milestoneRepository.save(m);
        return get(userId, goalId);
    }

    private Goal findOwned(UUID userId, UUID goalId) {
        return goalRepository.findByIdAndUserId(goalId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Goal", goalId));
    }

    private GoalResponse toResponse(Goal g) {
        return GoalResponse.builder()
            .id(g.getId()).userId(g.getUser().getId()).title(g.getTitle())
            .category(g.getCategory()).targetDate(g.getTargetDate())
            .progress(g.getProgress()).status(g.getStatus()).notes(g.getNotes())
            .milestones(g.getMilestones().stream().map(m ->
                GoalResponse.MilestoneResponse.builder()
                    .id(m.getId()).title(m.getTitle())
                    .completed(m.isCompleted()).targetDate(m.getTargetDate()).build()
            ).collect(Collectors.toList()))
            .createdAt(g.getCreatedAt()).updatedAt(g.getUpdatedAt()).build();
    }
}
