package com.muicochay.mory.chat.repository;

import com.fantus.mory.chat.document.DirectMessage;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.UUID;


public interface DirectMessageRepository extends MongoRepository<DirectMessage, ObjectId> {
    List<DirectMessage> findByRelationshipIdOrderByCreateAtAsc(UUID relationshipId);
}
