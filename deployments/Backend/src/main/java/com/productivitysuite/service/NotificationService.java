package com.productivitysuite.service;

import com.productivitysuite.entity.Notification;
import com.productivitysuite.entity.User;
import com.productivitysuite.exception.ResourceNotFoundException;
import com.productivitysuite.repository.NotificationRepository;
import com.productivitysuite.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepo;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<Notification> list(UUID userId) {
        return notificationRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Notification markRead(UUID userId, UUID notifId) {
        Notification n = notificationRepo.findByIdAndUserId(notifId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Notification", notifId));
        n.setRead(true);
        return notificationRepo.save(n);
    }

    public void delete(UUID userId, UUID notifId) {
        Notification n = notificationRepo.findByIdAndUserId(notifId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Notification", notifId));
        notificationRepo.delete(n);
    }

    public Notification push(UUID userId, Notification.NotificationType type, String title, String message) {
        User user = userRepository.findById(userId).orElseThrow();
        return notificationRepo.save(Notification.builder()
            .user(user).type(type).title(title).message(message).build());
    }
}
