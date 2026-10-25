package com.productivitysuite.repository;
import com.productivitysuite.entity.DailyPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import java.time.LocalDate; import java.util.*;
public interface DailyPlanRepository extends JpaRepository<DailyPlan, UUID> {
 @EntityGraph(attributePaths = {"items", "items.task"})
 List<DailyPlan> findByUserIdAndPlanDateOrderByVersionDesc(UUID userId, LocalDate date);
 Optional<DailyPlan> findByIdAndUserId(UUID id, UUID userId);
}
