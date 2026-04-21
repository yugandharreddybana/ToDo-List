package com.productivitysuite.repository;

import com.productivitysuite.entity.GoalMilestone;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface GoalMilestoneRepository extends JpaRepository<GoalMilestone, UUID> {
    Optional<GoalMilestone> findByIdAndGoalId(UUID id, UUID goalId);
}
