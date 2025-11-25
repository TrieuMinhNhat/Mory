package com.muicochay.mory.user.service;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.muicochay.mory.auth.enums.AuthProvider;
import com.muicochay.mory.cache.constants.CacheNames;
import com.muicochay.mory.connection.dto.ConnectionResponse;
import com.muicochay.mory.connection.entity.Connection;
import com.muicochay.mory.connection.enums.ConnectionStatus;
import com.muicochay.mory.connection.repository.ConnectionRepository;
import com.muicochay.mory.connection.utils.ConnectionUtils;
import com.muicochay.mory.media.service.MediaService;
import com.muicochay.mory.shared.exception.auth.AccountAlreadyOnboardedEx;
import com.muicochay.mory.shared.exception.global.InvalidArgumentEx;
import com.muicochay.mory.shared.exception.global.ResourcesAccessDeniedEx;
import com.muicochay.mory.shared.exception.global.ResourcesNotFoundEx;
import com.muicochay.mory.user.dto.OnboardingRequest;
import com.muicochay.mory.user.dto.OnboardingResponse;
import com.muicochay.mory.user.dto.UpdateUserProfileRequest;
import com.muicochay.mory.user.dto.UpdateUserProfileResponse;
import com.muicochay.mory.user.dto.UserPreviewResponse;
import com.muicochay.mory.user.dto.UserProfileResponse;
import com.muicochay.mory.user.entity.User;
import com.muicochay.mory.user.entity.UserProfile;
import com.muicochay.mory.user.interfaces.UserConnectionAndProviderProjection;
import com.muicochay.mory.user.interfaces.UserProfileAndConnectionProjection;
import com.muicochay.mory.user.repositoriy.UserProfileRepository;
import com.muicochay.mory.user.repositoriy.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;
    private final ConnectionRepository connectionRepository;
    private final MediaService mediaService;

    @Transactional
    @CacheEvict(value = CacheNames.AUTH_USER_CACHE, key = "T(com.muicochay.mory.cache.util.CacheKeys).checkAuthKey(#userId)")
    public OnboardingResponse onboarding(OnboardingRequest request, UUID userId) {
        if (request.getDisplayName() == null || request.getDisplayName().isBlank()) {
            throw new InvalidArgumentEx("DisplayName must not be blank");
        }

        UserProfile userProfile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourcesNotFoundEx("UserInfo not found with userId: " + userId));

        if (userProfile.isOnboarded()) {
            throw new AccountAlreadyOnboardedEx("Already onboarded");
        }
        if (request.getDisplayName().trim().length() > 25) {
            throw new InvalidArgumentEx("Display name cannot exceed 25 characters");
        } else if (request.getDisplayName().trim().length() < 6) {
            throw new InvalidArgumentEx("Display name must be at least 6 characters long");
        }

        userProfile.setDisplayName(request.getDisplayName());
        userProfile.setOnboarded(true);
        userProfile.setAvatarUrl(request.getAvatarImageUrl());
        return OnboardingResponse.builder()
                .avatarUrl(userProfile.getAvatarUrl())
                .displayName(userProfile.getDisplayName())
                .onboarded(userProfile.isOnboarded())
                .build();
    }

    public UserProfileResponse getUserProfile(UUID userId, UUID requesterId) {
        UUID connectionId = ConnectionUtils.generateConnectionId(userId, requesterId);
        if (!userId.equals(requesterId)) {
            boolean connected = connectionRepository.existsDirectOrMutualConnection(
                    connectionId,
                    requesterId,
                    userId,
                    ConnectionStatus.CONNECTED.name()
            );
            if (!connected) {
                throw new ResourcesAccessDeniedEx("Connection not found or you do not have access");
            }
        }
        UserProfileResponse response = UserProfileResponse.builder().build();
        if (userId.equals(requesterId)) {
            UserConnectionAndProviderProjection data = userRepository.getUserConnectionAndProvider(
                    userId,
                    ConnectionStatus.CONNECTED,
                    AuthProvider.EMAIL_PASSWORD
            );
            response.setConnectionCount(data.getConnectionCount());
            response.setHasEmailPasswordProvider(data.getHasEmailPasswordProvider());
        } else {
            UserProfileAndConnectionProjection data = userProfileRepository.getUserProfileAndConnection(
                    userId,
                    ConnectionStatus.CONNECTED,
                    connectionId
            );
            List<User> mutualConnections = userRepository.findMutualConnections(requesterId, userId, ConnectionStatus.CONNECTED);
            List<UserPreviewResponse> mutualConnectionPreviews = mutualConnections.stream()
                    .distinct()
                    .map(user -> UserPreviewResponse.builder()
                    .id(user.getId())
                    .displayName(user.getProfile().getDisplayName())
                    .avatarUrl(user.getProfile().getAvatarUrl())
                    .build()
                    )
                    .toList();
            Connection connection = data.getConnection();
            response.setAvatarUrl(data.getAvatarUrl());
            response.setDisplayName(data.getDisplayName());
            response.setConnectionCount(data.getConnectionCount());

            ConnectionResponse connectionResponse = connection != null
                    ? ConnectionResponse.builder()
                            .id(connection.getId())
                            .connectionType(connection.getConnectionType())
                            .mutualConnections(mutualConnectionPreviews)
                            .status(connection.getStatus())
                            .build()
                    : ConnectionResponse.builder().build();
            response.setConnection(connectionResponse);
        }
        return response;

    }

    @Transactional
    @CacheEvict(value = CacheNames.AUTH_USER_CACHE, key = "T(com.muicochay.mory.cache.util.CacheKeys).checkAuthKey(#userId)")
    public UpdateUserProfileResponse updateInfo(UUID userId, UpdateUserProfileRequest request) {
        UserProfile userProfile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourcesNotFoundEx("UserInfo not found with userId: " + userId));
        if (request.getDisplayName() != null) {
            if (request.getDisplayName().trim().length() > 25) {
                throw new InvalidArgumentEx("Display name cannot exceed 25 characters");
            } else if (request.getDisplayName().trim().length() < 6) {
                throw new InvalidArgumentEx("Display name must be at least 6 characters long");
            }
            userProfile.setDisplayName(request.getDisplayName());
        }
        if (request.getAvatarImageUrl() != null && !request.getAvatarImageUrl().isBlank()) {
            if (userProfile.getAvatarUrl() != null) {
                cleanUpMedia(userProfile.getAvatarUrl());
            }
            userProfile.setAvatarUrl(request.getAvatarImageUrl());
        }
        return UpdateUserProfileResponse.builder()
                .avatarUrl(userProfile.getAvatarUrl())
                .displayName(userProfile.getDisplayName())
                .build();
    }

    private void cleanUpMedia(String mediaUrl) {
        try {
            mediaService.delete(mediaUrl);
        } catch (IOException ignored) {
        }
    }

}
