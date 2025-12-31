package com.muicochay.mory.user.service;

import com.muicochay.mory.user.dto.UserContextCache;
import com.muicochay.mory.user.dto.UserPreviewResponse;
import com.muicochay.mory.user.dto.UserProfileCache;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface UserProfileCacheService {
    Map<UUID, UserProfileCache> getProfileMap(Collection<UUID> ids);

    Map<UUID, UserPreviewResponse> getPreviewMap(Collection<UUID> ids);

    Map<UUID, UserContextCache> getContextMap(Collection<UUID> ids);

    List<UserPreviewResponse> getPreviews(List<UUID> ids);

    void invalidate(UUID userId);

    void invalidateAll(Collection<UUID> userIds);
}
