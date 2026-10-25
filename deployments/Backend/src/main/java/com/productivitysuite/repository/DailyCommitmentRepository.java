package com.productivitysuite.repository;
import com.productivitysuite.entity.DailyCommitment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface DailyCommitmentRepository extends JpaRepository<DailyCommitment, UUID> {
    List<DailyCommitment> findByUserIdOrderByStartTime(UUID userId);
    Optional<DailyCommitment> findByIdAndUserId(UUID id, UUID userId);
}
