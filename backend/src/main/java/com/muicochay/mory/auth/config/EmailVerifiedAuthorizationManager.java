package com.muicochay.mory.auth.config;

import com.muicochay.mory.auth.model.AuthUserPrincipal;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.stereotype.Component;

import java.util.function.Supplier;

@Component
public class EmailVerifiedAuthorizationManager implements AuthorizationManager<RequestAuthorizationContext> {

    @Override
    public AuthorizationDecision check(Supplier<Authentication> authentication, RequestAuthorizationContext object) {
        Authentication auth = authentication.get();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof AuthUserPrincipal user) {
            return new AuthorizationDecision(user.isVerified());
        }
        return new AuthorizationDecision(false);
    }
}
