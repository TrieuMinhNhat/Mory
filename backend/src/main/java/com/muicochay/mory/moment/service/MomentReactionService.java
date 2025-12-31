package com.muicochay.mory.moment.service;

import com.muicochay.mory.moment.dto.MomentReactionSummary;
import com.muicochay.mory.moment.entity.MomentReaction;
import com.muicochay.mory.moment.repository.MomentReactionRepository;
import com.muicochay.mory.shared.enums.ReactionType;
import com.muicochay.mory.shared.exception.global.InvalidArgumentEx;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MomentReactionService {

    private final MomentReactionRepository reactionRepository;

    @Transactional
    public ReactionType toggleReaction(
            UUID userId,
            UUID momentId,
            ReactionType reactionType
    ) {
        if (reactionType == null) {
            throw new InvalidArgumentEx("Reaction type must not be null");
        }

        Optional<MomentReaction> existingOpt =
                reactionRepository.findByMomentIdAndUserId(momentId, userId);

        if (existingOpt.isPresent()) {
            MomentReaction existing = existingOpt.get();

            if (existing.getReactionType() == reactionType) {
                reactionRepository.delete(existing);
                return null;
            }

            existing.setReactionType(reactionType);
            reactionRepository.save(existing);
            return reactionType;
        }

        MomentReaction created = MomentReaction.builder()
                .momentId(momentId)
                .userId(userId)
                .reactionType(reactionType)
                .build();

        reactionRepository.save(created);
        return reactionType;
    }

    /**
     * Lấy reaction của 1 moment
     */
    @Transactional(readOnly = true)
    public MomentReactionSummary getMomentReactions(UUID momentId) {
        List<MomentReaction> reactions =
                reactionRepository.findAllByMomentId(momentId);

        Map<UUID, ReactionType> userReactions = reactions.stream()
                .collect(Collectors.toMap(
                        MomentReaction::getUserId,
                        MomentReaction::getReactionType
                ));

        return new MomentReactionSummary(momentId, userReactions);
    }

    /**
     * Lấy reaction cho nhiều moment (feed)
     */
    @Transactional(readOnly = true)
    public List<MomentReactionSummary> getReactionsForMoments(List<UUID> momentIds) {
        if (momentIds.isEmpty()) {
            return List.of();
        }

        List<MomentReaction> reactions =
                reactionRepository.findAllByMomentIdIn(momentIds);

        Map<UUID, Map<UUID, ReactionType>> grouped =
                reactions.stream()
                        .collect(Collectors.groupingBy(
                                MomentReaction::getMomentId,
                                Collectors.toMap(
                                        MomentReaction::getUserId,
                                        MomentReaction::getReactionType
                                )
                        ));

        return grouped.entrySet().stream()
                .map(e -> new MomentReactionSummary(e.getKey(), e.getValue()))
                .toList();
    }

    /**
     * Xóa toàn bộ reaction khi xóa moment
     */
    @Transactional
    public void deleteReactionsByMoment(UUID momentId) {
        reactionRepository.deleteAllByMomentId(momentId);
    }
}
