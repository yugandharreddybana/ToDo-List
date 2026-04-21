package com.productivitysuite.repository;

import com.productivitysuite.entity.AIConversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AIConversationRepository extends JpaRepository<AIConversation, UUID> {
    Optional<AIConversation> findTopByUserIdOrderByUpdatedAtDesc(UUID userId);
    Optional<AIConversation> findByIdAndUserId(UUID id, UUID userId);
}
