package com.muicochay.mory.chat.service;

import com.fantus.mory.chat.document.DirectMessage;
import com.fantus.mory.chat.repository.DirectMessageRepository;
import com.fantus.mory.connection.entity.Connection;
import com.fantus.mory.connection.repository.ConnectionRepository;
import com.fantus.mory.shared.exception.global.ResourcesNotFoundEx;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DirectMessageService {
    private final DirectMessageRepository directMessageRepository;
    private final ConnectionRepository connectionRepository;
    private final RedisLimitService redisLimitService;

    /**
     * Send a direct message with daily limit enforced via Redis.
     *
     * @param relationshipId the relationship id
     * @param senderId       sender user id
     * @param text        text content
     * @return saved Message
     */
    public DirectMessage sendMessage(UUID relationshipId, UUID senderId, String text) {
        Connection connection = connectionRepository.findById(relationshipId)
                .orElseThrow(() -> new ResourcesNotFoundEx("Relationship not found with Id: " + relationshipId));

        DirectMessage msg = DirectMessage.builder()
                .id(new ObjectId())
                .relationshipId(relationshipId)
                .senderId(senderId)
                .text(text)
                .build();

        return directMessageRepository.save(msg);
    }

    /**
     * Retrieve direct messages for a relationship, ordered by creation time.
     */
    public List<DirectMessage> getMessages(UUID relationshipId) {
        return directMessageRepository.findByRelationshipIdOrderByCreateAtAsc(relationshipId);
    }

}
