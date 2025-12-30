package com.muicochay.mory.story.repository;

import com.muicochay.mory.story.entity.StoryMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface StoryMemberRepository extends JpaRepository<StoryMember, UUID>, StoryMemberBatchRepository {
    int deleteByStoryIdAndUserId(UUID storyId, UUID userId);

    @Modifying
    @Query("DELETE FROM StoryMember sm WHERE sm.story.id = :storyId AND sm.user.id IN :userIds")
    int deleteByStoryIdAndUserIdIn(@Param("storyId") UUID storyId, @Param("userIds") List<UUID> userIds);


    List<StoryMember> findByStoryId(UUID storyId);
}
