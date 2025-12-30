package com.muicochay.mory.user.repositoriy;

import com.muicochay.mory.auth.enums.AuthProvider;
import com.muicochay.mory.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    @Modifying
    @Transactional
    @Query("""
            DELETE FROM User u
            WHERE u.passwordVerifiedAt IS NULL
              AND u.createdAt < :cutoff
              AND u.deletedAt IS NULL
              AND (
                  u.providers IS EMPTY
                  OR (SIZE(u.providers) = 1 AND :emailPassword MEMBER OF u.providers)
              )
        """)
    int deleteUnverifiedEmailPasswordOnlyUsers(@Param("cutoff") Instant cutoff,
                                               @Param("emailPassword") AuthProvider emailPassword);
}
