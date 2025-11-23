package com.muicochay.mory.moment.repository;

import com.fantus.mory.moment.document.MomentReaction;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface MomentReactionRepository extends MongoRepository<MomentReaction, ObjectId> {
    Optional<MomentReaction> findByMomentId(ObjectId momentId);

    List<MomentReaction> findAllByMomentIdIn(List<ObjectId> momentIds);

    void deleteByMomentId(ObjectId momentId);
}
