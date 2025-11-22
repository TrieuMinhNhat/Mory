package com.muicochay.mory.admin.specification;

import com.muicochay.mory.auth.enums.AuthProvider;
import com.muicochay.mory.user.enums.RoleCode;
import com.muicochay.mory.user.entity.User;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public class AdminUserSpecification {

    public static Specification<User> hasKeyword(String keyword) {
        return ((root, query, criteriaBuilder) -> {
            if (keyword == null || keyword.trim().isEmpty()) {
                return null;
            }

            String like = "%" + keyword.toLowerCase() + "%";
            Join<Object, Object> profileJoin = root.join("profile", JoinType.LEFT);

            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), like),
                    criteriaBuilder.like(criteriaBuilder.lower(profileJoin.get("displayName")), like)
            );
        });
    }

    public static Specification<User> hasRole(RoleCode role) {
        return (root, query, criteriaBuilder) -> {
            if (role == null) {
                return null;
            }

            return criteriaBuilder.equal(root.get("roleCode"), role);
        };
    }

    public static Specification<User> excludeUser(UUID userId) {
        return (root, query, criteriaBuilder) -> {
            if (userId == null) {
                return null;
            }
            return criteriaBuilder.notEqual(root.get("id"), userId);
        };
    }

    public static Specification<User> isActive(Boolean active) {
        return (root, query, cb) -> {
            if (active == null) {
                return null;
            }

            // join providers collection
            Join<Object, Object> providers = root.join("providers", JoinType.LEFT);

            if (active) {
                return cb.and(
                        cb.isNull(root.get("deletedAt")),
                        cb.or(
                                cb.isNotNull(root.get("passwordVerifiedAt")),
                                providers.in(AuthProvider.GOOGLE, AuthProvider.EMAIL_OTP)
                        )
                );
            } else {
                return cb.or(
                        cb.isNotNull(root.get("deletedAt")),
                        cb.and(
                                cb.isNull(root.get("passwordVerifiedAt")),
                                cb.not(providers.in(AuthProvider.GOOGLE, AuthProvider.EMAIL_OTP))
                        )
                );
            }
        };
    }
}
