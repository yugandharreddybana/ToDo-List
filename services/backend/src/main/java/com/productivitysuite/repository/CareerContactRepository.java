package com.productivitysuite.repository;

import com.productivitysuite.entity.CareerContact;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CareerContactRepository extends JpaRepository<CareerContact, UUID> {
    List<CareerContact> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
