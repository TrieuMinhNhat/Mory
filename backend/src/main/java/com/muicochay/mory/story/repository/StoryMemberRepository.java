package com.muicochay.mory.story.repository;

import com.muicochay.mory.story.entity.StoryMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface StoryMemberRepository extends JpaRepository<StoryMember, UUID> {
    int deleteByStoryIdAndUserId(UUID storyId, UUID userId);
}
