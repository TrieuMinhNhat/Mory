package com.muicochay.mory.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserPreviewWithMutualConnectionResponse {

    private UserPreviewResponse user;
    private List<UserPreviewResponse> mutualConnections;
}
