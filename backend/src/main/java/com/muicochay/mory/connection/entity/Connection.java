package com.muicochay.mory.connection.entity;

import com.muicochay.mory.connection.enums.ConnectionStatus;
import com.muicochay.mory.connection.enums.ConnectionType;
import com.muicochay.mory.shared.entity.BaseAuditEntity;
import com.muicochay.mory.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "connections", uniqueConstraints = {@UniqueConstraint(columnNames = {"user1_id", "user2_id"})})
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Connection extends BaseAuditEntity {
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user1_id", nullable = false)
    private User user1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user2_id", nullable = false)
    private User user2;

    @Column(name = "connection_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private ConnectionType connectionType;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ConnectionStatus status;
}
