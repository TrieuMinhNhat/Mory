package com.muicochay.mory.admin.repository;

import com.muicochay.mory.auth.enums.AuthProvider;
import com.muicochay.mory.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface AdminUserRepository extends JpaRepository<User, UUID>, JpaSpecificationExecutor<User> {

    @Query("SELECT COUNT(u) FROM User u")
    long countAllUsers();

    @Query("""
            SELECT COUNT(u)
            FROM User u
            WHERE u.deletedAt IS NULL
              AND (
                u.passwordVerifiedAt IS NOT NULL
                OR :googleProvider MEMBER OF u.providers
                OR :otpProvider MEMBER OF u.providers
              )
        """)
    long countActiveUsers(@Param("googleProvider") AuthProvider googleProvider,
            @Param("otpProvider") AuthProvider otpProvider);

    @Query("SELECT COUNT(u) FROM User u WHERE u.deletedAt IS NOT NULL")
    long countDeletedUsers();

    // ===== Last month stats =====
    @Query(value = """
        SELECT COUNT(*) FROM USERS u
        WHERE u.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
            AND u.created_at < DATE_TRUNC('month', CURRENT_DATE)
    """, nativeQuery = true)
    long countAllUsersLastMonth();

    @Query(value = """
            SELECT COUNT(DISTINCT u.id)
            FROM USERS u
            LEFT JOIN USER_PROVIDERS up ON up.user_id = u.id
            WHERE u.deleted_at IS NULL
              AND (
                u.password_verified_at IS NOT NULL
                OR up.auth_provider IN ('GOOGLE', 'EMAIL_OTP')
              )
              AND u.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
              AND u.created_at < DATE_TRUNC('month', CURRENT_DATE)
        """, nativeQuery = true)
    long countActiveUsersLastMonth();

    @Query(value = """
        SELECT COUNT(*) FROM USERS u
        WHERE u.deleted_at IS NOT NULL
            AND u.deleted_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
            AND u.deleted_at < DATE_TRUNC('month', CURRENT_DATE)
    """, nativeQuery = true)
    long countDeletedUsersLastMonth();

    @Query("""
    SELECT function('date', u.createdAt), COUNT(u)
    FROM User u
    WHERE u.createdAt BETWEEN :start AND :end
    GROUP BY function('date', u.createdAt)
    ORDER BY function('date', u.createdAt)
    """)
    List<Object[]> countUsersByDateRange(
            @Param("start") Instant start,
            @Param("end") Instant end
    );
}
