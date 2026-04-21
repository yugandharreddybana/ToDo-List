package com.productivitysuite.repository;

import com.productivitysuite.entity.RosterShift;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RosterShiftRepository extends JpaRepository<RosterShift, UUID> {
    List<RosterShift> findByUserIdOrderByShiftDateAsc(UUID userId);
    List<RosterShift> findByUserIdAndShiftDateBetweenOrderByShiftDateAsc(UUID userId, LocalDate from, LocalDate to);
    Optional<RosterShift> findByIdAndUserId(UUID id, UUID userId);
}
