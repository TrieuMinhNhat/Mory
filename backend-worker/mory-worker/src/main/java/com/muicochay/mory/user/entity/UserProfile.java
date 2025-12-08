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

    @PrePersist
    public void prePersist() {
        if (this.timezone == null) {
            this.timezone = "Asia/Ho_Chi_Minh";
        }
    }
}

