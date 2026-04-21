package com.productivitysuite.repository;

import com.productivitysuite.entity.Subtask;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface SubtaskRepository extends JpaRepository<Subtask, UUID> {
    Optional<Subtask> findByIdAndTaskId(UUID id, UUID taskId);
}
