package com.muicochay.mory.auth.config;

import com.muicochay.mory.auth.dto.TokenPair;
import com.muicochay.mory.auth.enums.AuthProvider;
import com.muicochay.mory.auth.enums.TokenType;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.*;

@Component
public class JwtTokenHelper {

    @Value("${jwt.auth.app}")
    private String appName;

    @Value("${jwt.auth.secret_key}")
    private String secretKey;

    @Value("${jwt.auth.access_expires_in}")
    private int accessExpiresIn;

    @Value("${jwt.auth.refresh_expires_in}")
    private int refreshExpiresIn;

    public TokenPair generateTokenPair(
            UUID userId,
            boolean isVerified,
            String roleCode,
            AuthProvider authProvider
    ) {
        String refreshTokenId = UUID.randomUUID().toString();
        String accessToken = generateToken(
                userId,
                TokenType.ACCESS,
                isVerified,
                roleCode,
                authProvider,
                null);
        String refreshToken = generateToken(
                userId,
                TokenType.REFRESH,
                isVerified,
                roleCode,
                authProvider,
                refreshTokenId);
        return TokenPair.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .refreshTokenId(refreshTokenId)
                .build();
    }

    public String generateToken(
            UUID userId,
            TokenType tokenType,
            boolean isVerified,
            String roleCode,
            AuthProvider authProvider,
            String refreshTokenId
    ) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("provider", authProvider.name());
        claims.put("verified", isVerified);
        claims.put("roleCode", roleCode);

        if (tokenType == TokenType.REFRESH && refreshTokenId != null) {
            claims.put("refresh_token_id", refreshTokenId);
        }

        Date expiration = tokenType == TokenType.ACCESS
                ? getAccessExpirationDate()
                : getRefreshExpirationDate();

        return Jwts.builder()
                .issuer(appName)
                .subject(String.valueOf(userId))
                .claims(claims)
                .issuedAt(new Date())
                .expiration(expiration)
                .signWith(getSigningKey())
                .compact();
    }

    public TokenType getTokenTypeFromToken(String token) {
        try {
            boolean isRefreshToken = getTokenIdFromToken(token) != null;
            if (isRefreshToken) {
                return TokenType.REFRESH;
            }
            return TokenType.ACCESS;
        } catch (Exception e) {
            return null;
        }
    }

    public Boolean getIsVerifiedFromToken(String token) {
        try {
            Claims claims = getAllClaimsFromToken(token);
            return claims.get("verified", Boolean.class);
        } catch (Exception e) {
            return null;
        }
    }

    public String getRoleCodeFromToken(String token) {
        try {
            Claims claims = getAllClaimsFromToken(token);
            return claims.get("roleCode", String.class);
        } catch (Exception e) {
            return null;
        }
    }

    public AuthProvider getProviderFromToken(String token) {
        try {
            Claims claims = getAllClaimsFromToken(token);
            String providerStr = claims.get("provider", String.class);
            return AuthProvider.valueOf(providerStr);
        } catch (Exception e) {
            return null;
        }
    }

    public String getTokenIdFromToken(String token) {
        try {
            Claims claims = getAllClaimsFromToken(token);
            return claims.get("refresh_token_id", String.class);
        } catch (Exception e) {
            return null;
        }
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private Date getAccessExpirationDate() {
        return new Date(new Date().getTime() + accessExpiresIn * 1000L);
    }

    private Date getRefreshExpirationDate() {
        return new Date(new Date().getTime() + refreshExpiresIn * 1000L);
    }

    public boolean validateToken(String token, TokenType expectedType) {
        if (isTokenExpired(token)) {
            return false;
        }
        TokenType tokenType = getTokenTypeFromToken(token);
        return expectedType == tokenType;
    }

    private boolean isTokenExpired(String token) {
        Date expireDate = getExpireDate(token);
        if (expireDate == null) {
            return false;
        }
        return expireDate.before(new Date());
    }

    private Date getExpireDate(String token) {
        Date expireDate;
        try {
            final Claims claims = this.getAllClaimsFromToken(token);
            if (claims == null) {
                return null;
            }
            expireDate = claims.getExpiration();
        } catch (Exception e) {
            expireDate = null;
        }
        return expireDate;
    }

    public String getToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("access_token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }

        String authHeader = getAuthHeaderFromHeader(request);
        if (authHeader != null && authHeader.startsWith("Bearer")) {
            return authHeader.substring(7);
        }
        return null;
    }

    private String getAuthHeaderFromHeader(HttpServletRequest request) {
        return request.getHeader("Authorization");
    }

    public UUID getUserIdFromToken(String authToken) {
        UUID userId;
        try {
            final Claims claims = this.getAllClaimsFromToken(authToken);
            if (claims == null) {
                return null;
            }
            userId = UUID.fromString(claims.getSubject());
        } catch (Exception e) {
            userId = null;
        }
        return userId;
    }

    private Claims getAllClaimsFromToken(String token) {
        Claims claims;
        try {
            claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            claims = null;
        }
        return claims;
    }
}
