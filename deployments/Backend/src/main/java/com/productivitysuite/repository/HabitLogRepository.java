package com.productivitysuite.repository;

import com.productivitysuite.entity.HabitLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HabitLogRepository extends JpaRepository<HabitLog, UUID> {
    Optional<HabitLog> findByHabitIdAndLogDate(UUID habitId, LocalDate date);
    List<HabitLog> findByHabitIdOrderByLogDateDesc(UUID habitId);
}
