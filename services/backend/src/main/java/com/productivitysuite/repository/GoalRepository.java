package com.productivitysuite.repository;

import com.productivitysuite.entity.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GoalRepository extends JpaRepository<Goal, UUID> {
    List<Goal> findByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<Goal> findByIdAndUserId(UUID id, UUID userId);

    @Query("SELECT g FROM Goal g WHERE g.status = 'ACTIVE' AND g.targetDate BETWEEN :from AND :to")
    List<Goal> findApproachingDeadlines(@Param("from") Instant from, @Param("to") Instant to);
}
