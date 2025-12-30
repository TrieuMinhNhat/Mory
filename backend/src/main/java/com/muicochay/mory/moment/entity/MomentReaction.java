package com.muicochay.mory.moment.entity;

import com.muicochay.mory.shared.entity.BaseAuditEntity;
import com.muicochay.mory.shared.enums.ReactionType;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(
        name = "moment_reactions",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_moment_user",
                        columnNames = {"moment_id", "user_id"}
                )
        },
        indexes = {
                @Index(name = "idx_reaction_moment", columnList = "moment_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MomentReaction extends BaseAuditEntity {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "moment_id", nullable = false)
    private UUID momentId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "reaction_type", nullable = false)
    private ReactionType reactionType;

}
