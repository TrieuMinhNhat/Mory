package com.muicochay.mory.user.entity;

import com.muicochay.mory.shared.entity.BaseAuditEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.util.UUID;

@Table(name = "USER_PROFILES")
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class UserProfile extends BaseAuditEntity {
    @Id
    @GeneratedValue
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    private String displayName;

    private String avatarUrl;

    private String phoneNumber;

    private boolean onboarded = false;

    @Column(nullable = false)
    private String timezone;

    @Column(nullable = false)
    private String locale;

    private static final String DEFAULT_TIMEZONE = "Asia/Ho_Chi_Minh";
    private static final String DEFAULT_LOCALE = "vi-VN";

    @PrePersist
    @PreUpdate
    private void applyDefaults() {
        if (timezone == null) {
            timezone = DEFAULT_TIMEZONE;
        }
        if (locale == null) {
            locale = DEFAULT_LOCALE;
        }
    }
}



