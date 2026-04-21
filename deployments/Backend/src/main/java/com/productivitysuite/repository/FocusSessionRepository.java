package com.productivitysuite.repository;

import com.productivitysuite.entity.FocusSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FocusSessionRepository extends JpaRepository<FocusSession, UUID> {
    List<FocusSession> findByUserIdOrderByStartTimeDesc(UUID userId);
    Optional<FocusSession> findByIdAndUserId(UUID id, UUID userId);

    @Query("SELECT COALESCE(SUM(s.durationMinutes), 0) FROM FocusSession s WHERE s.user.id = :uid AND s.startTime >= :from AND s.startTime < :to")
    int sumMinutesBetween(@Param("uid") UUID uid, @Param("from") Instant from, @Param("to") Instant to);
}
