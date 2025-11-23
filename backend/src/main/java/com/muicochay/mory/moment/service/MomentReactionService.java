package com.muicochay.mory.moment.service;

import com.fantus.mory.moment.document.MomentReaction;
import com.fantus.mory.moment.repository.MomentReactionRepository;
import com.fantus.mory.shared.enums.ReactionType;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class MomentReactionService {
    private final MomentReactionRepository momentReactionRepository;

    @Transactional
    public MomentReaction toggleReaction(UUID userId, ObjectId momentId, ReactionType reactionType) {
        MomentReaction doc = momentReactionRepository.findByMomentId(momentId)
                .orElseGet(() -> MomentReaction.builder()
                        .momentId(momentId)
                        .userReactions(new HashMap<>())
                        .build()
                );
        Map<UUID, ReactionType> userReactions =
                Optional.ofNullable(doc.getUserReactions()).orElseGet(HashMap::new);

        ReactionType oldReaction = userReactions.get(userId);

        if (oldReaction != null) {
            if (oldReaction.equals(reactionType)) {
                userReactions.remove(userId);
            } else {
                userReactions.put(userId, reactionType);
            }
        } else {
            userReactions.put(userId, reactionType);
        }
        doc.setUserReactions(userReactions);
        return momentReactionRepository.save(doc);
    }

    @Transactional(readOnly = true)
    public MomentReaction getMomentReactions(ObjectId momentId) {
        return momentReactionRepository.findByMomentId(momentId).orElse(null);
    }

    @Transactional(readOnly = true)
    public List<MomentReaction> getReactionsForMoments(List<ObjectId> momentIds) {
        if (momentIds == null || momentIds.isEmpty()) return Collections.emptyList();
        return momentReactionRepository.findAllByMomentIdIn(momentIds);
    }

    @Transactional
    public void deleteReactionsByMoment(ObjectId momentId) {
        momentReactionRepository.deleteByMomentId(momentId);
    }
}
