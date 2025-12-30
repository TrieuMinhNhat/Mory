package com.muicochay.mory.moment.entity;

import com.muicochay.mory.shared.enums.Visibility;
import com.muicochay.mory.shared.entity.BaseAuditEntity;
import com.muicochay.mory.story.entity.Story;
import com.muicochay.mory.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "moments")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class Moment extends BaseAuditEntity {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @JoinColumn(name="story_id")
    private Story story;

    @ManyToOne(optional = false)
    @JoinColumn(name="user_id")
    private User user;

    @Column(columnDefinition = "text", nullable = false)
    private String mediaUrl;

    @Column(columnDefinition = "text")
    private String audioUrl;

    @Column(columnDefinition = "text")
    private String caption;

    @Enumerated(EnumType.STRING)
    private Visibility visibility;
    // BEFORE_AFTER 0/1
    private Integer position;
    // JOURNEY & CHALLENGE
    private Integer dayIndex;

    private LocalDate date;

    private Instant deletedAt;

    private boolean isMilestone = false;
}