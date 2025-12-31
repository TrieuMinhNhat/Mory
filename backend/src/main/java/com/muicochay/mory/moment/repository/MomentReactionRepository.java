package com.muicochay.mory.moment.repository;

import com.muicochay.mory.moment.entity.MomentReaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MomentReactionRepository extends JpaRepository<MomentReaction, UUID> {
    Optional<MomentReaction> findByMomentIdAndUserId(UUID momentId, UUID userId);

    List<MomentReaction> findAllByMomentId(UUID momentId);

    List<MomentReaction> findAllByMomentIdIn(List<UUID> momentIds);

    void deleteAllByMomentId(UUID momentId);
}
