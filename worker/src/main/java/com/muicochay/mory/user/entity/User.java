package com.muicochay.mory.user.entity;

import com.muicochay.mory.auth.enums.AuthProvider;
import com.muicochay.mory.shared.entity.BaseAuditEntity;
import com.muicochay.mory.user.enums.RoleCode;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Table(name = "USERS")
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class User extends BaseAuditEntity {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @Column(name = "auth_provider")
    private Set<AuthProvider> providers = new HashSet<>();

    private Instant passwordVerifiedAt;

    public boolean isPasswordVerified() {
        return passwordVerifiedAt != null;
    }

    private Instant deletedAt;

    public boolean isDeleted() {
        return deletedAt != null;
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoleCode roleCode;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private UserProfile profile;
}
