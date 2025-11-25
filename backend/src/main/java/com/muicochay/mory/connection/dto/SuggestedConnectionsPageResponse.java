package com.muicochay.mory.connection.dto;

import com.fantus.mory.user.dto.UserPreviewWithMutualConnectionResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SuggestedConnectionsPageResponse {
    private List<UserPreviewWithMutualConnectionResponse> suggestions;
    private boolean hasNext;
    private Instant nextCursorCreatedAt;
    private UUID nextCursorId;
}
