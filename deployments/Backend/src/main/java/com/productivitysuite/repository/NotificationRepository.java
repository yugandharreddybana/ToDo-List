package com.productivitysuite.repository;

import com.productivitysuite.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByUserIdAndDismissedFalseOrderByCreatedAtDesc(UUID userId);
    Optional<Notification> findByIdAndUserId(UUID id, UUID userId);
    boolean existsByUserIdAndDedupeKey(UUID userId, String dedupeKey);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.user.id = :userId AND n.read = false")
    void markAllReadByUserId(UUID userId);

    @Modifying
    @Query(value = """
        INSERT INTO todo_list.notifications (id, user_id, type, title, message, is_read, created_at, dedupe_key)
        VALUES (gen_random_uuid(), :userId, :type, :title, :message, false, NOW(), :dedupeKey)
        ON CONFLICT (user_id, dedupe_key) DO NOTHING
        """, nativeQuery = true)
    int insertOnce(@Param("userId") UUID userId, @Param("type") String type,
                   @Param("title") String title, @Param("message") String message,
                   @Param("dedupeKey") String dedupeKey);
}
