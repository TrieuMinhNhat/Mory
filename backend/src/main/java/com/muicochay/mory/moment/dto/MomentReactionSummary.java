package com.muicochay.mory.moment.dto;

import com.muicochay.mory.shared.enums.ReactionType;
import lombok.*;

import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MomentReactionSummary {

    private UUID momentId;

    /**
     * Map userId -> reactionType
     * Dùng cho:
     * - kiểm tra user đã react chưa
     * - hiển thị reaction của user hiện tại
     */
    private Map<UUID, ReactionType> userReactions;

    public int getTotalReactions() {
        return userReactions == null ? 0 : userReactions.size();
    }
}
