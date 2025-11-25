package com.muicochay.mory.story.entity;

import com.muicochay.mory.shared.entity.BaseAuditEntity;
import com.muicochay.mory.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(
        name = "story_members",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"story_id", "user_id"})
        }
        )
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class StoryMember extends BaseAuditEntity {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(optional=false)
    @JoinColumn(name="story_id")
    private Story story;

    @ManyToOne(optional=false)
    @JoinColumn(name="user_id")
    private User user;
}
