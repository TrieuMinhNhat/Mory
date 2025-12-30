package com.muicochay.mory.conversation.dto;

import lombok.*;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateLastReadStatusRequest {
    @NonNull
    private UUID conversationId;
    @NonNull
    private UUID messageId;
}
