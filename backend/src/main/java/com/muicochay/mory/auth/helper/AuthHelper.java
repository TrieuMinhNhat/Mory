package com.muicochay.mory.auth.helper;

import com.muicochay.mory.auth.enums.AuthProvider;
import com.muicochay.mory.user.entity.User;
import com.muicochay.mory.user.enums.RoleCode;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.*;

public class AuthHelper {

    public static Set<AuthProvider> mergeProviders(User user, AuthProvider newProvider) {
        Set<AuthProvider> providers = Optional.ofNullable(user)
                .map(User::getProviders)
                .map(HashSet::new)
                .orElseGet(HashSet::new);

        providers.add(newProvider);
        return providers;
    }

    public static List<GrantedAuthority> getAuthorities(String roleCode) {
        if (roleCode == null) {
            return List.of();
        }
        return List.of(new SimpleGrantedAuthority(roleCode));
    }

    public static String mapAuthoritiesToRoleCode(Collection<? extends GrantedAuthority> authorities) {
        if (authorities == null || authorities.isEmpty()) {
            return RoleCode.USER.name();
        }
        return authorities.iterator().next().getAuthority();
    }

    public static boolean isStrongPassword(CharSequence password) {
        if (password == null) {
            return false;
        }
        String pw = password.toString();
        if (pw.length() < 6) {
            return false;
        }
        if (pw.contains(" ")) {
            return false;
        }
        String pattern = "^(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-={}\\[\\]:;\"'<>,.?/]).+$";
        return pw.matches(pattern);
    }

}
