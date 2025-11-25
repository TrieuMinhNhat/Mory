package com.muicochay.mory.conversation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ConversationPageResponse {
    private List<ConversationResponse> conversations;
    private boolean hasNext;
    private Instant nextCursorLastSentAt;
    private UUID nextCursorId;
}
