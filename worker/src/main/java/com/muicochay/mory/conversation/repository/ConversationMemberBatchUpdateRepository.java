package com.muicochay.mory.conversation.repository;


import com.muicochay.mory.conversation.dto.ConversationMemberUpdate;

import java.util.List;

public interface ConversationMemberBatchUpdateRepository {
    void batchUpdate(List<ConversationMemberUpdate> updates);
}
