package com.muicochay.mory.auth.service;

import com.muicochay.mory.auth.config.JwtTokenHelper;
import com.muicochay.mory.auth.dto.AuthUserResponse;
import com.muicochay.mory.auth.dto.CreatePasswordRequest;
import com.muicochay.mory.auth.dto.TokenPair;
import com.muicochay.mory.auth.dto.signin.BlockedAuthProviderResponse;
import com.muicochay.mory.auth.enums.AuthProvider;
import com.muicochay.mory.auth.enums.TokenType;
import com.muicochay.mory.auth.helper.AuthHelper;
import com.muicochay.mory.auth.repository.AuthUserRepository;
import com.muicochay.mory.otp.dto.EmailJob;
import com.muicochay.mory.otp.enums.EmailTemplateType;
import com.muicochay.mory.otp.service.EmailQueueService;
import com.muicochay.mory.shared.config.AppProperties;
import com.muicochay.mory.shared.exception.auth.BlockedAuthProviderEx;
import com.muicochay.mory.shared.exception.auth.InvalidTokenEx;
import com.muicochay.mory.shared.exception.auth.SamePasswordEx;
import com.muicochay.mory.shared.exception.auth.WeakPasswordEx;
import com.muicochay.mory.shared.exception.global.InvalidResourceStateEx;
import com.muicochay.mory.shared.exception.global.ResourcesNotFoundEx;
import com.muicochay.mory.user.entity.User;
import com.muicochay.mory.user.mapper.UserProfileMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DefaultAuthService {

    private final JwtTokenHelper jwtTokenHelper;
    private final AuthUserRepository authUserRepository;

    private final EmailQueueService emailQueueService;
    private final PasswordEncoder passwordEncoder;
    private final UserProfileMapper userProfileMapper;

    private final RefreshTokenRedisService refreshTokenRedisService;
    private final ResetPasswordRedisService resetPasswordRedisService;

    private final AppProperties appProperties;

    @Cacheable(value = "authUserCache", key = "T(com.muicochay.mory.cache.util.CacheKeys).checkAuthKey(#userId)")
    public AuthUserResponse checkAuth(UUID userId, AuthProvider authProvider) {
        User user = authUserRepository.findById(userId)
                .orElseThrow(() -> new ResourcesNotFoundEx("User not found with Id: " + userId));
        boolean isVerified = authProvider != AuthProvider.EMAIL_PASSWORD || user.isPasswordVerified();
        return buildAuthUserResponse(user, isVerified);
    }

    public TokenPair validateRefreshTokenAndGenerateTokenPair(String refreshToken, String ip, String userAgent) {
        UUID userId = jwtTokenHelper.getUserIdFromToken(refreshToken);
        Boolean isVerified = jwtTokenHelper.getIsVerifiedFromToken(refreshToken);
        String roleCode = jwtTokenHelper.getRoleCodeFromToken(refreshToken);
        String refreshTokenId = jwtTokenHelper.getTokenIdFromToken(refreshToken);
        AuthProvider currentProvider = jwtTokenHelper.getProviderFromToken(refreshToken);
        if (userId == null) {
            throw new InvalidTokenEx("Can not get username from Token");
        }
        if (currentProvider == null) {
            throw new InvalidTokenEx("Can not get provider from Token");
        }
        if (refreshTokenId == null) {
            throw new InvalidTokenEx("Can not get tokenId from Token");
        }
        if (!jwtTokenHelper.validateToken(refreshToken, TokenType.REFRESH)) {
            throw new InvalidTokenEx("Failed to validate Token");
        }
        if (!refreshTokenRedisService.validateRefreshToken(userId, refreshTokenId)) {
            throw new InvalidTokenEx("Failed to validate Token");
        }
        refreshTokenRedisService.revokeToken(userId, refreshTokenId);
        TokenPair newTokenPair = jwtTokenHelper.generateTokenPair(
                userId,
                isVerified,
                roleCode,
                currentProvider
        );
        refreshTokenRedisService.saveSession(
                userId,
                newTokenPair.getRefreshTokenId(),
                ip,
                userAgent
        );
        return newTokenPair;
    }

    public void signOut(UUID userId, String refreshToken) {
        String refreshTokenId = jwtTokenHelper.getTokenIdFromToken(refreshToken);
        if (refreshTokenId == null) {
            throw new InvalidTokenEx("Can not get tokenId from Token");
        }
        refreshTokenRedisService.revokeToken(userId, refreshTokenId);
    }

    public void createPassword(UUID userId, CreatePasswordRequest request) {
        User user = authUserRepository.findById(userId)
                .orElseThrow(() -> new ResourcesNotFoundEx("User not found with id: " + userId));
        if (user.getProviders().contains(AuthProvider.EMAIL_PASSWORD)) {
            throw new InvalidResourceStateEx("");
        }
        if (!AuthHelper.isStrongPassword(request.getPassword())) {
            throw new WeakPasswordEx("Weak password");
        }
        user.setProviders(AuthHelper.mergeProviders(user, AuthProvider.EMAIL_PASSWORD));
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPasswordVerifiedAt(Instant.now());
        authUserRepository.save(user);
    }

    public void handleForgotPassword(String email) {
        User user = authUserRepository.findByEmail(email)
                .orElseThrow(() -> new ResourcesNotFoundEx("User not found with email: " + email));
        if (!user.getProviders().contains(AuthProvider.EMAIL_PASSWORD)) {
            BlockedAuthProviderResponse response = BlockedAuthProviderResponse.builder()
                    .blockedProvider(AuthProvider.EMAIL_PASSWORD)
                    .build();
            throw new BlockedAuthProviderEx("", response);
        }
        String link = resetPasswordRedisService.generateTokenAndLink(email);
        System.out.println("link: " + link);
        Map<String, Object> vars = new HashMap<>();
        vars.put("resetLink", link);
        EmailJob emailJob = EmailJob.builder()
                .email(user.getEmail())
                .subject("Reset your " + appProperties.getAppName() + " password")
                .templateType(EmailTemplateType.RESET_PASSWORD)
                .variables(vars)
                .build();
        emailQueueService.pushToMailQueue(emailJob);
    }

    @Transactional
    public void handleResetPassword(String token, String email, CharSequence newPassword) {
        resetPasswordRedisService.validateToken(token, email);
        User user = authUserRepository.findByEmail(email)
                .orElseThrow(() -> new ResourcesNotFoundEx("User not found with email: " + email));

        if (!user.getProviders().contains(AuthProvider.EMAIL_PASSWORD)) {
            BlockedAuthProviderResponse response = BlockedAuthProviderResponse.builder()
                    .blockedProvider(AuthProvider.EMAIL_PASSWORD)
                    .build();
            throw new BlockedAuthProviderEx("", response);
        }
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new SamePasswordEx("The new password must not be the same as the current password.", true);
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        if (!user.isPasswordVerified()) {
            user.setPasswordVerifiedAt(Instant.now());
        }
        resetPasswordRedisService.deleteToken(token);
        authUserRepository.save(user);
    }

    public boolean checkEmail(String email) {
        return authUserRepository.existsByEmail(email);
    }

    private AuthUserResponse buildAuthUserResponse(User user, boolean isVerified) {
        return AuthUserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .isVerified(isVerified)
                .profile(userProfileMapper.toDto(user.getProfile()))
                .roleCode(user.getRoleCode())
                .build();
    }
}
