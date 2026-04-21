package com.productivitysuite.repository;

import com.productivitysuite.entity.Task;
import com.productivitysuite.entity.Task.TaskStatus;
import com.productivitysuite.entity.Task.TaskPriority;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID> {

    @Query("""
        SELECT t FROM Task t WHERE t.user.id = :userId
        AND (:status IS NULL OR t.status = :status)
        AND (:priority IS NULL OR t.priority = :priority)
        AND (:tag IS NULL OR :tag = ANY(t.tags))
        AND (:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY t.order ASC, t.createdAt DESC
        """)
    Page<Task> findFiltered(
        @Param("userId") UUID userId,
        @Param("status") TaskStatus status,
        @Param("priority") TaskPriority priority,
        @Param("tag") String tag,
        @Param("search") String search,
        Pageable pageable
    );

    Optional<Task> findByIdAndUserId(UUID id, UUID userId);

    List<Task> findByUserIdAndRecurringTrue(UUID userId);

    @Query("SELECT t FROM Task t WHERE t.user.id = :userId AND t.dueDate BETWEEN :from AND :to AND t.status != 'DONE' AND t.status != 'ARCHIVED'")
    List<Task> findDueBetween(@Param("userId") UUID userId, @Param("from") Instant from, @Param("to") Instant to);
}
