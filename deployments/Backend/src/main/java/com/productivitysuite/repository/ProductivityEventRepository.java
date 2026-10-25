package com.productivitysuite.repository;
import com.productivitysuite.entity.ProductivityEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
import java.time.Instant;
public interface ProductivityEventRepository extends JpaRepository<ProductivityEvent, UUID> {
    List<ProductivityEvent> findTop1000ByUserIdOrderByCreatedAtDesc(UUID userId);
    List<ProductivityEvent> findByUserIdAndEventTypeAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(UUID userId, String eventType, Instant from, Instant to);
}
