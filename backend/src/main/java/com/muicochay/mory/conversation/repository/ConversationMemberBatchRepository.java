package com.muicochay.mory.conversation.repository;

import com.muicochay.mory.conversation.dto.ConversationMemberCreateRequest;

import java.util.List;

public interface ConversationMemberBatchRepository {
    void saveAllIgnoreDuplicates(List<ConversationMemberCreateRequest> members);
}
