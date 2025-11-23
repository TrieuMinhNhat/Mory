package com.muicochay.mory.moment.repository;

import com.fantus.mory.moment.document.Moment;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface MomentRepository extends MongoRepository<Moment, ObjectId>, MomentCustomRepository {
    int countByStoryIdAndUserIdAndDeletedAtIsNull(UUID storyId, UUID userId);

    boolean existsByStoryIdAndUserIdAndDateAndDeletedAtIsNull(UUID storyId, UUID userId, LocalDate date);

    Optional<Moment> findByIdAndDeletedAtIsNull(ObjectId id);

    boolean existsByStoryIdAndDeletedAtIsNull(UUID storyId);

}
