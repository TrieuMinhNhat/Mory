package com.muicochay.mory.auth.repository;

import com.muicochay.mory.user.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;

import java.util.Optional;
import java.util.UUID;

public interface AuthUserRepository extends JpaRepository<User, UUID> {

    @EntityGraph(attributePaths = {"providers", "profile"})
    Optional<User> findByEmail(String email);

    @EntityGraph(attributePaths = {"providers", "profile"})
    @NonNull
    Optional<User> findById(@NonNull UUID id);

    @Query("SELECT u.email FROM User u WHERE u.id = :id")
    Optional<String> findEmailOnlyById(@Param("id") UUID id);

    boolean existsByEmail(String email);
}
