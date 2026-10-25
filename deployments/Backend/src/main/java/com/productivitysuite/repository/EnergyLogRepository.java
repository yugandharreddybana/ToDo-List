package com.productivitysuite.repository;
import com.productivitysuite.entity.EnergyLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.Instant; import java.util.*;
public interface EnergyLogRepository extends JpaRepository<EnergyLog, UUID> { List<EnergyLog> findByUserIdAndLoggedAtBetweenOrderByLoggedAtAsc(UUID userId, Instant from, Instant to); }
