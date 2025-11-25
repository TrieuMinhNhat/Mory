package com.muicochay.mory.story.entity;

import com.muicochay.mory.shared.entity.BaseAuditEntity;
import com.muicochay.mory.shared.enums.Visibility;
import com.muicochay.mory.story.enums.StoryScope;
import com.muicochay.mory.story.enums.StoryType;
import com.muicochay.mory.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.bson.types.ObjectId;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "stories")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class Story extends BaseAuditEntity {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id")
    private User creator;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StoryType type;

    private String title;

    //JOURNEY && CHALLENGE
    private LocalDate startDate;
    private LocalDate endDate;

    //CHALLENGE
    private Integer duration;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StoryScope scope;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Visibility visibility;

    private Instant deletedAt;

    //BEFORE_AFTER
    @Column(name = "has_before")
    private boolean hasBefore = false;
    @Column(name = "has_after")
    private boolean hasAfter = false;

    @OneToMany(mappedBy = "story", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StoryMember> members = new ArrayList<>();

    private Instant latestMomentCreatedAt;
    private ObjectId latestMomentId;

}
