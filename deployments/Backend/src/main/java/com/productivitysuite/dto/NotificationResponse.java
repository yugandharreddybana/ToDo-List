package com.productivitysuite.dto;

import com.productivitysuite.entity.Notification;
import java.time.Instant;
import java.util.UUID;

public record NotificationResponse(UUID id, Notification.NotificationType type, String title,
                                   String body, boolean read, Instant createdAt) {
    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(n.getId(), n.getType(), n.getTitle(), n.getMessage(), n.isRead(), n.getCreatedAt());
    }
}
