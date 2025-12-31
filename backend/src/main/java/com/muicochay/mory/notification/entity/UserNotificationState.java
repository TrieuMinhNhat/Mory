package com.muicochay.mory.notification.entity;

import com.muicochay.mory.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "USER_NOTIFICATION_STATE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserNotificationState {
    @Id
    @Column(name = "user_id")
    private UUID userId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "last_read_notification_id")
    private UUID lastReadNotificationId;

    private Instant lastReadAt;
}
