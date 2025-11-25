package com.muicochay.mory.user.mapper;

import com.muicochay.mory.user.dto.UserPreviewResponse;
import com.muicochay.mory.user.entity.User;
import org.mapstruct.Mapper;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

@Mapper(componentModel = "spring")
public interface UserMapper {

    default UserPreviewResponse toProfilePreview(User user) {
        if (user == null || user.getProfile() == null) {
            return null;
        }
        return UserPreviewResponse.builder()
                .id(user.getId())
                .displayName(user.getProfile().getDisplayName())
                .avatarUrl(user.getProfile().getAvatarUrl())
                .build();
    }

    default List<UserPreviewResponse> toProfilePreviewList(Collection<User> users) {
        if (users == null) {
            return Collections.emptyList();
        }
        return users.stream()
                .map(this::toProfilePreview)
                .filter(Objects::nonNull)
                .toList();
    }
}
