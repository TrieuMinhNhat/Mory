package com.muicochay.mory.auth.service;

import com.muicochay.mory.auth.config.JwtTokenHelper;
import com.muicochay.mory.auth.dto.AuthUserResponse;
import com.muicochay.mory.auth.dto.TokenPair;
import com.muicochay.mory.auth.dto.signin.SignInResponse;
import com.muicochay.mory.auth.enums.AuthProvider;
import com.muicochay.mory.auth.helper.AuthHelper;
import com.muicochay.mory.auth.repository.AuthUserRepository;
import com.muicochay.mory.otp.dto.EmailJob;
import com.muicochay.mory.otp.enums.EmailTemplateType;
import com.muicochay.mory.otp.enums.OtpType;
import com.muicochay.mory.otp.service.EmailQueueService;
import com.muicochay.mory.otp.service.OtpService;
import com.muicochay.mory.shared.config.AppProperties;
import com.muicochay.mory.shared.dto.BlockInfoResponse;
import com.muicochay.mory.shared.exception.auth.BlockedAccountEx;
import com.muicochay.mory.shared.exception.global.ResourcesNotFoundEx;
import com.muicochay.mory.shared.service.BlockedUserService;
import com.muicochay.mory.user.entity.User;
import com.muicochay.mory.user.mapper.UserProfileMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EmailOtpAuthService {

    private final AuthUserRepository authUserRepository;
    private final BlockedUserService blockedUserService;
    private final JwtTokenHelper jwtTokenHelper;
    private final RefreshTokenRedisService refreshTokenRedisService;
    private final EmailQueueService emailQueueService;
    private final OtpService otpService;
    private final UserProfileMapper userProfileMapper;

    private final AppProperties appProperties;

    public SignInResponse signIn(String email, String inputOtp, String ip, String userAgent) {
        Optional<User> optionalUser = authUserRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            throw new ResourcesNotFoundEx("User not found with email: " + email);
        }
        User user = optionalUser.get();
        boolean blocked = blockedUserService.isBlocked(user.getId());
        if (blocked) {
            BlockInfoResponse blockInfoResponse = blockedUserService.getBlockInfo(user.getId());
            throw new BlockedAccountEx("Account blocked", blockInfoResponse);
        }

        otpService.verifyOtp(OtpType.SIGN_IN, user.getId(), inputOtp);

        if (!user.getProviders().contains(AuthProvider.EMAIL_OTP)) {
            user.setProviders(AuthHelper.mergeProviders(user, AuthProvider.EMAIL_OTP));
            authUserRepository.save(user);
        }
        TokenPair tokenPair = jwtTokenHelper.generateTokenPair(
                user.getId(),
                true,
                user.getRoleCode().name(),
                AuthProvider.EMAIL_OTP
        );
        refreshTokenRedisService.saveSession(
                user.getId(),
                tokenPair.getRefreshTokenId(),
                ip,
                userAgent
        );
        AuthUserResponse authUserResponse = AuthUserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .isVerified(true)
                .profile(userProfileMapper.toDto(user.getProfile()))
                .roleCode(user.getRoleCode())
                .build();
        return SignInResponse.builder()
                .accessToken(tokenPair.getAccessToken())
                .refreshToken(tokenPair.getRefreshToken())
                .user(authUserResponse)
                .build();
    }

    public void sendOtp(String email) {
        Optional<User> optionalUser = authUserRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            throw new ResourcesNotFoundEx("User not found with email: " + email);
        }
        User user = optionalUser.get();
        boolean blocked = blockedUserService.isBlocked(user.getId());
        if (blocked) {
            BlockInfoResponse blockInfoResponse = blockedUserService.getBlockInfo(user.getId());
            throw new BlockedAccountEx("Account blocked", blockInfoResponse);
        }
        String otp = otpService.generateOtp(
                OtpType.SIGN_IN,
                user.getId()
        );
        Map<String, Object> vars = new HashMap<>();
        vars.put("otp", otp);
        EmailJob emailJob = EmailJob.builder()
                .email(email)
                .subject("Your sign-in code for " + appProperties.getAppName())
                .templateType(EmailTemplateType.OTP_SIGN_IN)
                .variables(vars)
                .build();
        emailQueueService.pushToMailQueue(emailJob);
    }
}
