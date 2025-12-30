package com.muicochay.mory.connection.dto;

import com.muicochay.mory.user.dto.UserPreviewWithMutualConnectionResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SuggestedConnectionsPageResponse {
    private List<UserPreviewWithMutualConnectionResponse> suggestions;
}
