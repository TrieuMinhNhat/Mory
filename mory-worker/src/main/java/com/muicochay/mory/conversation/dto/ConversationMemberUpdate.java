package com.muicochay.mory.conversation.dto;

import org.bson.types.ObjectId;

import java.time.Instant;
import java.util.UUID;

public record ConversationMemberUpdate(UUID conversationId, UUID userId, String compositeKey,
                                        ObjectId lastReadMessageId, Instant lastReadAt, int unreadCount) {}