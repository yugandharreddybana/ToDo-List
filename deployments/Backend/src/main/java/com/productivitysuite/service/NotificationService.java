package com.productivitysuite.service;

import com.productivitysuite.entity.Notification;
import com.productivitysuite.dto.NotificationResponse;
import com.productivitysuite.entity.User;
import com.productivitysuite.exception.ResourceNotFoundException;
import com.productivitysuite.repository.NotificationRepository;
import com.productivitysuite.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepo;
    private final UserRepository userRepository;
    private final PlanningService events;

    @Transactional(readOnly = true)
    public List<NotificationResponse> list(UUID userId) {
        return notificationRepo.findByUserIdAndDismissedFalseOrderByCreatedAtDesc(userId).stream().map(NotificationResponse::from).toList();
    }

    public NotificationResponse markRead(UUID userId, UUID notifId) {
        Notification n = notificationRepo.findByIdAndUserId(notifId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Notification", notifId));
        n.setRead(true);
        events.record(userId, "notification.read", "notification", notifId, Map.of());
        return NotificationResponse.from(notificationRepo.save(n));
    }

    public void markAllRead(UUID userId) {
        for (Notification notification : notificationRepo.findByUserIdAndDismissedFalseOrderByCreatedAtDesc(userId)) notification.setRead(true);
        events.record(userId, "notification.read_all", "notification", null, Map.of());
    }

    public void delete(UUID userId, UUID notifId) {
        Notification n = notificationRepo.findByIdAndUserId(notifId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Notification", notifId));
        n.setDismissed(true);
        events.record(userId, "notification.dismissed", "notification", notifId, Map.of());
    }

    public Notification push(UUID userId, Notification.NotificationType type, String title, String message) {
        User user = userRepository.findById(userId).orElseThrow();
        return notificationRepo.save(Notification.builder()
            .user(user).type(type).title(title).message(message).build());
    }

    public boolean pushOnce(UUID userId, Notification.NotificationType type, String title, String message, String dedupeKey) {
        if (dedupeKey == null || dedupeKey.isBlank() || dedupeKey.length() > 160) throw new IllegalArgumentException("Invalid notification dedupe key");
        if (!userRepository.findById(userId).orElseThrow().isNotificationsEnabled()) return false;
        boolean inserted = notificationRepo.insertOnce(userId, type.name(), title, message, dedupeKey) == 1;
        if (inserted) events.record(userId, "notification.sent", "notification", null, Map.of("type", type.name(), "dedupeKey", dedupeKey));
        return inserted;
    }

    @Transactional(readOnly = true)
    public boolean existsKey(UUID userId, String dedupeKey) {
        return notificationRepo.existsByUserIdAndDedupeKey(userId, dedupeKey);
    }
}
