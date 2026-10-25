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
    private final PlanningService events;

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
        Goal saved = goalRepository.save(goal);
        events.record(userId, "goal.created", "goal", saved.getId(), java.util.Map.of());
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public GoalResponse get(UUID userId, UUID goalId) {
        return toResponse(findOwned(userId, goalId));
    }

    public GoalResponse update(UUID userId, UUID goalId, GoalPatchRequest req) {
        Goal goal = findOwned(userId, goalId);
        if (req.getTitle() != null) goal.setTitle(req.getTitle());
        if (req.getCategory() != null) goal.setCategory(req.getCategory());
        if (req.getTargetDate() != null) goal.setTargetDate(req.getTargetDate());
        if (req.getProgress() != null) goal.setProgress(req.getProgress());
        if (req.getStatus() != null) goal.setStatus(req.getStatus());
        if (req.getNotes() != null) goal.setNotes(req.getNotes());
        Goal saved = goalRepository.save(goal);
        events.record(userId, "goal.updated", "goal", saved.getId(), java.util.Map.of("progress", saved.getProgress()));
        return toResponse(saved);
    }

    public GoalResponse updateProgress(UUID userId, UUID goalId, int progress) {
        if (progress < 0 || progress > 100) throw new IllegalArgumentException("Progress must be between 0 and 100");
        Goal goal = findOwned(userId, goalId);
        goal.setProgress(progress);
        events.record(userId, "goal.progress", "goal", goalId, java.util.Map.of("progress", progress));
        return toResponse(goal);
    }

    public List<GoalResponse.MilestoneResponse> milestones(UUID userId, UUID goalId) {
        return get(userId, goalId).getMilestones();
    }

    public GoalResponse setMilestoneCompleted(UUID userId, UUID goalId, UUID milestoneId, boolean completed) {
        findOwned(userId, goalId);
        GoalMilestone milestone = milestoneRepository.findByIdAndGoalId(milestoneId, goalId)
            .orElseThrow(() -> new ResourceNotFoundException("Milestone", milestoneId));
        milestone.setCompleted(completed);
        milestoneRepository.save(milestone);
        events.record(userId, "goal.milestone.updated", "goal_milestone", milestoneId, java.util.Map.of("completed", completed));
        return get(userId, goalId);
    }

    public void deleteMilestone(UUID userId, UUID goalId, UUID milestoneId) {
        findOwned(userId, goalId);
        GoalMilestone milestone = milestoneRepository.findByIdAndGoalId(milestoneId, goalId)
            .orElseThrow(() -> new ResourceNotFoundException("Milestone", milestoneId));
        milestoneRepository.delete(milestone);
        events.record(userId, "goal.milestone.deleted", "goal_milestone", milestoneId, java.util.Map.of());
    }

    public void delete(UUID userId, UUID goalId) {
        goalRepository.delete(findOwned(userId, goalId));
        events.record(userId, "goal.deleted", "goal", goalId, java.util.Map.of());
    }

    public GoalResponse addMilestone(UUID userId, UUID goalId, MilestoneRequest req) {
        Goal goal = findOwned(userId, goalId);
        GoalMilestone m = GoalMilestone.builder()
            .goal(goal).title(req.getTitle()).targetDate(req.getTargetDate()).build();
        goal.getMilestones().add(m);
        Goal saved = goalRepository.save(goal);
        events.record(userId, "goal.milestone.created", "goal", goalId, java.util.Map.of());
        return toResponse(saved);
    }

    public GoalResponse updateMilestone(UUID userId, UUID goalId, UUID mId, MilestoneRequest req) {
        findOwned(userId, goalId);
        GoalMilestone m = milestoneRepository.findByIdAndGoalId(mId, goalId)
            .orElseThrow(() -> new ResourceNotFoundException("Milestone", mId));
        if (req.getTitle() != null) m.setTitle(req.getTitle());
        if (req.getCompleted() != null) m.setCompleted(req.getCompleted());
        if (req.getTargetDate() != null) m.setTargetDate(req.getTargetDate());
        milestoneRepository.save(m);
        events.record(userId, "goal.milestone.updated", "goal_milestone", mId, java.util.Map.of());
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
