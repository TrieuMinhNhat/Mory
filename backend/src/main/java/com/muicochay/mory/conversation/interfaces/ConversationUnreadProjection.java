package com.muicochay.mory.conversation.interfaces;

import java.util.UUID;

public interface ConversationUnreadProjection {
    UUID getConversationId();
    long getUnreadCount();
}
