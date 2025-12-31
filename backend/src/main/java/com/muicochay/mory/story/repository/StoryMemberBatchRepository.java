package com.muicochay.mory.story.repository;

import com.muicochay.mory.story.dto.StoryMemberCreateRequest;

import java.util.List;

public interface StoryMemberBatchRepository {
    void saveAllIgnoreDuplicates(List<StoryMemberCreateRequest> members);
}
