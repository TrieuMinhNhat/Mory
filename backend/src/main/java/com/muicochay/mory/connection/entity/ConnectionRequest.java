package com.muicochay.mory.connection.entity;

import com.muicochay.mory.connection.enums.ConnectionType;
import com.muicochay.mory.connection.enums.RequestStatus;
import com.muicochay.mory.shared.entity.BaseAuditEntity;
import com.muicochay.mory.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "connection_requests")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ConnectionRequest extends BaseAuditEntity {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ConnectionType newConnectionType;

    @Enumerated(EnumType.STRING)
    private ConnectionType oldConnectionType;

    @ManyToOne
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    @ManyToOne
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status;
}

