package com.productivitysuite.repository;

import com.productivitysuite.entity.HealthLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HealthLogRepository extends JpaRepository<HealthLog, UUID> {
    List<HealthLog> findByUserIdOrderByLogDateDesc(UUID userId);
    Optional<HealthLog> findByUserIdAndLogDate(UUID userId, LocalDate logDate);
}
