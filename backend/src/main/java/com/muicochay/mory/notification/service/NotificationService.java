package com.muicochay.mory.notification.service;

import com.muicochay.mory.notification.dto.NotificationPageResponse;
import com.muicochay.mory.notification.dto.NotificationResponse;
import com.muicochay.mory.notification.entity.Notification;
import com.muicochay.mory.notification.enums.NotificationType;
import com.muicochay.mory.notification.repository.NotificationRepository;
import com.muicochay.mory.shared.exception.global.ResourcesAccessDeniedEx;
import com.muicochay.mory.shared.exception.global.ResourcesNotFoundEx;
import com.muicochay.mory.user.dto.UserPreviewResponse;
import com.muicochay.mory.user.entity.UserProfile;
import com.muicochay.mory.user.repositoriy.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserProfileRepository userProfileRepository;

    public NotificationResponse createNotification(
            UUID userId,
            NotificationType type,
            Map<String, Object> metadata,
            UserPreviewResponse fromUser
    ) {
        Notification notification = Notification.builder()
                .userId(userId)
                .type(type)
                .metadata(metadata)
                .build();
        Notification savedNotification = notificationRepository.save(notification);
        return toNotificationResponse(savedNotification, fromUser);
    }

    public void deleteNotification(
            UUID userId,
            UUID notificationId
    ) {
        Notification notification = notificationRepository.findByIdAndDeletedAtIsNull(notificationId)
                .orElseThrow(() -> new ResourcesNotFoundEx("Notification not found with id: " + notificationId));
        if (!notification.getUserId().equals(userId)) {
            throw new ResourcesAccessDeniedEx("");
        }
        notification.setDeletedAt(Instant.now());
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public NotificationPageResponse getUserNotifications(
            UUID userId,
            Instant cursorCreatedAt,
            UUID cursorId,
            int size
    ) {
        List<UUID> notificationIds = notificationRepository.findIdsKeyset(
                userId,
                cursorCreatedAt,
                cursorId,
                size + 1
        );

        if (notificationIds.isEmpty()) {
            return NotificationPageResponse.builder().build();
        }

        List<Notification> notificationsUnordered = notificationRepository.findAllById(notificationIds);

        Map<UUID, Notification> map = notificationsUnordered.stream()
                .collect(Collectors.toMap(Notification::getId, n -> n));

        List<Notification> notifications = notificationIds.stream()
                .map(map::get)
                .toList();

        boolean hasNext = notifications.size() > size;
        if (hasNext) {
            notifications = notifications.subList(0, size);
        }

        Instant nextCursorCreatedAt = hasNext ? notifications.getLast().getCreatedAt() : null;
        UUID nextCursorId = hasNext ? notifications.getLast().getId() : null;

        Set<UUID> fromUserIds = notifications.stream()
                .map(Notification::getMetadata)
                .filter(Objects::nonNull)
                .map(m -> m.get("fromUserId"))
                .filter(Objects::nonNull)
                .map(Object::toString)
                .map(id -> {
                    try {
                        return UUID.fromString(id);
                    } catch (IllegalArgumentException e) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        List<UserProfile> profiles = fromUserIds.isEmpty()
                ? List.of()
                : userProfileRepository.findAllByUserIds(new ArrayList<>(fromUserIds));

        Map<UUID, UserPreviewResponse> userPreviewMap = profiles.stream()
                .collect(Collectors.toMap(
                        p -> p.getUser().getId(),
                        p -> UserPreviewResponse.builder()
                                .id(p.getUser().getId())
                                .displayName(p.getDisplayName())
                                .avatarUrl(p.getAvatarUrl())
                                .build()
                ));


        List<NotificationResponse> responses = notifications.stream()
                .map(n -> {
                    UUID fromUserId = null;

                    if (n.getMetadata() != null && n.getMetadata().get("fromUserId") != null) {
                        try {
                            fromUserId = UUID.fromString(
                                    n.getMetadata().get("fromUserId").toString()
                            );
                        } catch (IllegalArgumentException ignored) {
                        }
                    }

                    UserPreviewResponse fromUser =
                            fromUserId != null ? userPreviewMap.get(fromUserId) : null;

                    return toNotificationResponse(n, fromUser);
                })
                .toList();

        return NotificationPageResponse.builder()
                .notifications(responses)
                .hasNext(hasNext)
                .nextCursorCreatedAt(nextCursorCreatedAt)
                .nextCursorId(nextCursorId)
                .build();
    }

    private NotificationResponse toNotificationResponse(Notification notification, UserPreviewResponse fromUser) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .fromUser(fromUser)
                .type(notification.getType())
                .metadata(notification.getMetadata())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
