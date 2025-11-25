package com.muicochay.mory.moment.repository;

import com.muicochay.mory.moment.document.Moment;
import com.muicochay.mory.shared.enums.Visibility;
import com.muicochay.mory.story.dto.StoryMomentStats;
import org.bson.types.ObjectId;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MomentCustomRepository {
    int updateVisibilityByStoryId(UUID storyId, Visibility visibility);
    int softDeleteByStoryId(UUID storyId, Instant deletedAt);
    int unlinkByStoryId(UUID storyId);
    int unlinkByStoryIdAndUserId(UUID storyId, UUID userId);
    int unlinkByStoryIdAndUserIds(UUID storyId, Collection<UUID> userIds);
    int softDeleteByStoryIdAndUserId(UUID storyId, UUID userId, Instant deletedAt);
    int moveMomentsToAnotherStory(UUID oldStoryId, UUID newStoryId, UUID userId);
    int softDeleteByStoryIdAndUserIds(UUID storyId, Collection<UUID> userIds, Instant deletedAt);
    List<Moment> findMomentsKeyset(
            UUID creatorId,
            Instant cursorCreatedAt,
            ObjectId cursorId,
            boolean asc,
            int limit);
    List<Moment> findVisibleMomentsKeyset(
            UUID creatorId,
            UUID requesterId,
            Collection<Visibility> visibilities,
            Instant cursorCreatedAt,
            ObjectId cursorId,
            boolean asc,
            int limit);
    List<Moment> findByStoryIdKeySet(
            UUID storyId,
            Instant cursorCreatedAt,
            ObjectId cursorId,
            boolean asc,
            int limit);
    List<Moment> findFeedsKeyset(
            UUID requesterId,
            Instant cursorCreatedAt,
            ObjectId cursorId,
            boolean asc,
            int limit);
    List<Moment> findFeedsByTargetUserKeyset(
            UUID requesterId,
            UUID targetUserId,
            Instant cursorCreatedAt,
            ObjectId cursorId,
            boolean asc,
            int limit);

    List<StoryMomentStats> getMomentStatsByStoryIds(Collection<UUID> storyIds);
    Optional<StoryMomentStats> getMomentStatsByStoryId(UUID storyId);
    Optional<Moment> findLatestMomentByUserIdAndStoryId(UUID userId, UUID storyId);
    Optional<Moment> findLatestMomentByStoryIdExcludeUserId(UUID storyId, UUID excludedUserId);
}
