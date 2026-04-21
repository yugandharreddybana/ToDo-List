package com.productivitysuite.repository;

import com.productivitysuite.entity.CareerApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CareerApplicationRepository extends JpaRepository<CareerApplication, UUID> {
    List<CareerApplication> findByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<CareerApplication> findByIdAndUserId(UUID id, UUID userId);

    @Query("SELECT a FROM CareerApplication a WHERE a.user.id = :uid AND a.nextFollowUp BETWEEN :from AND :to")
    List<CareerApplication> findFollowUpsDue(@Param("uid") UUID uid, @Param("from") Instant from, @Param("to") Instant to);
}
