package com.muicochay.mory.moment.repository;

import com.fantus.mory.connection.enums.ConnectionStatus;
import com.fantus.mory.connection.enums.ConnectionType;
import com.fantus.mory.connection.interfaces.ConnectedUserProjection;
import com.fantus.mory.connection.repository.ConnectionRepository;
import com.fantus.mory.connection.utils.ConnectionUtils;
import com.fantus.mory.moment.document.Moment;
import com.fantus.mory.shared.enums.Visibility;
import com.fantus.mory.shared.exception.global.ResourcesAccessDeniedEx;
import com.fantus.mory.story.dto.StoryMomentStats;
import com.fantus.mory.story.repository.StoryRepository;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.GroupOperation;
import org.springframework.data.mongodb.core.aggregation.MatchOperation;
import org.springframework.data.mongodb.core.aggregation.ProjectionOperation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Repository
@RequiredArgsConstructor
public class MomentCustomRepositoryImpl implements MomentCustomRepository {

    private final MongoTemplate mongoTemplate;
    private final ConnectionRepository connectionRepository;
    private final StoryRepository storyRepository;

    @Override
    public int updateVisibilityByStoryId(UUID storyId, Visibility visibility) {
        Query query = Query.query(Criteria.where("storyId").is(storyId));
        Update update = new Update().set("visibility", visibility);
        return (int) mongoTemplate.updateMulti(query, update, Moment.class).getModifiedCount();
    }

    @Override
    public int softDeleteByStoryId(UUID storyId, Instant deletedAt) {
        Query query = Query.query(Criteria.where("storyId").is(storyId));
        Update update = new Update().set("deletedAt", deletedAt);
        return (int) mongoTemplate.updateMulti(query, update, Moment.class).getModifiedCount();
    }

    @Override
    public int unlinkByStoryId(UUID storyId) {
        Query query = Query.query(Criteria.where("storyId").is(storyId));
        Update update = new Update().unset("storyId");
        return (int) mongoTemplate.updateMulti(query, update, Moment.class).getModifiedCount();
    }

    @Override
    public int unlinkByStoryIdAndUserId(UUID storyId, UUID userId) {
        Query query = Query.query(Criteria.where("storyId").is(storyId).and("userId").is(userId));
        Update update = new Update().unset("storyId");
        return (int) mongoTemplate.updateMulti(query, update, Moment.class).getModifiedCount();
    }

    @Override
    public int unlinkByStoryIdAndUserIds(UUID storyId, Collection<UUID> userIds) {
        Query query = Query.query(Criteria.where("storyId").is(storyId).and("userId").in(userIds));
        Update update = new Update().unset("storyId");
        return (int) mongoTemplate.updateMulti(query, update, Moment.class).getModifiedCount();
    }

    @Override
    public int softDeleteByStoryIdAndUserId(UUID storyId, UUID userId, Instant deletedAt) {
        Query query = Query.query(Criteria.where("storyId").is(storyId).and("userId").is(userId));
        Update update = new Update().set("deletedAt", deletedAt);
        return (int) mongoTemplate.updateMulti(query, update, Moment.class).getModifiedCount();
    }

    @Override
    public int moveMomentsToAnotherStory(UUID oldStoryId, UUID newStoryId, UUID userId) {
        Query query = Query.query(Criteria.where("storyId").is(oldStoryId).and("userId").is(userId));
        Update update = new Update().set("storyId", newStoryId);
        return (int) mongoTemplate.updateMulti(query, update, Moment.class).getModifiedCount();
    }

    @Override
    public int softDeleteByStoryIdAndUserIds(UUID storyId, Collection<UUID> userIds, Instant deletedAt) {
        Query query = Query.query(Criteria.where("storyId").is(storyId).and("userId").in(userIds));
        Update update = new Update().set("deletedAt", deletedAt);
        return (int) mongoTemplate.updateMulti(query, update, Moment.class).getModifiedCount();
    }

    @Override
    public List<Moment> findMomentsKeyset(
            UUID creatorId,
            Instant cursorCreatedAt,
            ObjectId cursorId,
            boolean asc,
            int limit
    ) {
        Criteria criteria = Criteria.where("userId").is(creatorId)
                .and("deletedAt").is(null);

        if (cursorCreatedAt != null && cursorId != null) {
            Criteria pagingCriteria;
            if (asc) {
                pagingCriteria = new Criteria().orOperator(
                        Criteria.where("createdAt").gt(cursorCreatedAt),
                        new Criteria().and("createdAt").is(cursorCreatedAt).and("_id").gt(cursorId)
                );
            } else {
                pagingCriteria = new Criteria().orOperator(
                        Criteria.where("createdAt").lt(cursorCreatedAt),
                        new Criteria().and("createdAt").is(cursorCreatedAt).and("_id").lt(cursorId)
                );
            }
            criteria = criteria.andOperator(pagingCriteria);
        }

        Query query = new Query(criteria);
        if (asc) {
            query.with(Sort.by(Sort.Order.asc("createdAt"), Sort.Order.asc("_id")));
        } else {
            query.with(Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("_id")));
        }
        query.limit(limit);

        return mongoTemplate.find(query, Moment.class);
    }

    @Override
    public List<Moment> findVisibleMomentsKeyset(
            UUID creatorId,
            UUID requesterId,
            Collection<Visibility> visibilities,
            Instant cursorCreatedAt,
            ObjectId cursorId,
            boolean asc,
            int limit
    ) {
        Criteria baseCriteria = Criteria.where("userId").is(creatorId)
                .and("deletedAt").is(null);

        Criteria visibilityCriteria = Criteria.where("visibility").in(visibilities);

        Criteria tagCriteria = Criteria.where("tags").in(requesterId);

        Criteria visibilityOrTag = new Criteria().orOperator(visibilityCriteria, tagCriteria);

        Criteria finalCriteria = new Criteria().andOperator(baseCriteria, visibilityOrTag);

        if (cursorCreatedAt != null && cursorId != null) {
            Criteria pagingCriteria;
            if (asc) {
                pagingCriteria = new Criteria().orOperator(
                        Criteria.where("createdAt").gt(cursorCreatedAt),
                        new Criteria().and("createdAt").is(cursorCreatedAt).and("_id").gt(cursorId)
                );
            } else {
                pagingCriteria = new Criteria().orOperator(
                        Criteria.where("createdAt").lt(cursorCreatedAt),
                        new Criteria().and("createdAt").is(cursorCreatedAt).and("_id").lt(cursorId)
                );
            }
            finalCriteria = new Criteria().andOperator(finalCriteria, pagingCriteria);
        }

        Query query = new Query(finalCriteria);
        if (asc) {
            query.with(Sort.by(Sort.Order.asc("createdAt"), Sort.Order.asc("_id")));
        } else {
            query.with(Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("_id")));
        }
        query.limit(limit);

        return mongoTemplate.find(query, Moment.class);
    }

    @Override
    public List<Moment> findByStoryIdKeySet(
            UUID storyId,
            Instant cursorCreatedAt,
            ObjectId cursorId,
            boolean asc,
            int limit
    ) {
        Criteria baseCriteria = Criteria.where("storyId").is(storyId)
                .and("deletedAt").is(null);

        if (cursorCreatedAt != null && cursorId != null) {
            Criteria pagingCriteria;
            if (asc) {
                pagingCriteria = new Criteria().orOperator(
                        Criteria.where("createdAt").gt(cursorCreatedAt),
                        new Criteria().and("createdAt").is(cursorCreatedAt).and("_id").gt(cursorId)
                );
            } else {
                pagingCriteria = new Criteria().orOperator(
                        Criteria.where("createdAt").lt(cursorCreatedAt),
                        new Criteria().and("createdAt").is(cursorCreatedAt).and("_id").lt(cursorId)
                );
            }
            baseCriteria = new Criteria().andOperator(baseCriteria, pagingCriteria);
        }

        Query query = new Query(baseCriteria);
        if (asc) {
            query.with(Sort.by(Sort.Order.asc("createdAt"), Sort.Order.asc("_id")));
        } else {
            query.with(Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("_id")));
        }
        query.limit(limit);

        return mongoTemplate.find(query, Moment.class);
    }

    @Override
    public List<Moment> findFeedsKeyset(
            UUID requesterId,
            Instant cursorCreatedAt,
            ObjectId cursorId,
            boolean asc,
            int limit
    ) {
        // 1. Lấy danh sách user kết nối và connectionType tương ứng
        List<ConnectedUserProjection> connectedUserProjections = connectionRepository.findConnectedUsersWithTypeByCreatorAndStatus(
                requesterId,
                ConnectionStatus.CONNECTED
        );

        Map<UUID, ConnectionType> userIdToConnectionTypeMap = connectedUserProjections.stream()
                .filter(c -> !c.getUserId().equals(requesterId))
                .collect(Collectors.toMap(
                        ConnectedUserProjection::getUserId,
                        ConnectedUserProjection::getConnectionType
                ));

        // Danh sách userId kết nối
        List<UUID> connectedUserIds = userIdToConnectionTypeMap.keySet().stream().toList();

        // Danh sách userId để lấy stories mà họ có quyền
        List<UUID> userIds = Stream.concat(
                connectedUserIds.stream(),
                Stream.of(requesterId)
        ).toList();

        List<ObjectId> firstMomentIdInStory = storyRepository.findLatestMomentIdsByUserIdsKeysetLatestMoment(
                userIds,
                cursorCreatedAt,
                cursorId,
                asc,
                limit + 1
        );

        // 2. Build Criteria filter cho từng user kết nối dựa trên connectionType và visibility
        List<Criteria> connectedUserCriteria = userIdToConnectionTypeMap.entrySet().stream()
                .map(e -> {
                    UUID userId = e.getKey();
                    ConnectionType ct = e.getValue();

                    List<Visibility> allowedVisibilities = switch (ct) {
                        case FRIEND -> List.of(Visibility.ALL_FRIENDS);
                        case CLOSE_FRIEND -> List.of(Visibility.ALL_FRIENDS, Visibility.CLOSE_FRIENDS);
                        case SPECIAL ->
                                List.of(Visibility.ALL_FRIENDS, Visibility.CLOSE_FRIENDS, Visibility.PARTNER_ONLY);
                        default -> List.of(); // Không lấy gì nếu không xác định
                    };

                    return new Criteria().andOperator(
                            Criteria.where("userId").is(userId),
                            Criteria.where("visibility").in(allowedVisibilities)
                    );
                })
                .toList();

        Criteria connectedUsersCriteria = connectedUserCriteria.isEmpty()
                ? new Criteria().is(null)
                : new Criteria().orOperator(connectedUserCriteria.toArray(new Criteria[0]));

        Criteria userOrConnectedCriteria = new Criteria().orOperator(
                Criteria.where("userId").is(requesterId),
                connectedUsersCriteria
        );

        Criteria baseCriteria = new Criteria().andOperator(
                Criteria.where("deletedAt").is(null),
                new Criteria().orOperator(
                        Criteria.where("storyId").is(null).andOperator(userOrConnectedCriteria),
                        Criteria.where("storyId").ne(null).andOperator(
                                Criteria.where("_id").in(firstMomentIdInStory)
                        )
                )
        );


        // 3. Phân trang cursor
        if (cursorCreatedAt != null && cursorId != null) {
            Criteria pagingCriteria;
            if (asc) {
                pagingCriteria = new Criteria().orOperator(
                        Criteria.where("createdAt").gt(cursorCreatedAt),
                        new Criteria().and("createdAt").is(cursorCreatedAt).and("_id").gt(cursorId)
                );
            } else {
                pagingCriteria = new Criteria().orOperator(
                        Criteria.where("createdAt").lt(cursorCreatedAt),
                        new Criteria().and("createdAt").is(cursorCreatedAt).and("_id").lt(cursorId)
                );
            }
            baseCriteria = new Criteria().andOperator(baseCriteria, pagingCriteria);
        }

        Query query = new Query(baseCriteria);
        if (asc) {
            query.with(Sort.by(Sort.Order.asc("createdAt"), Sort.Order.asc("_id")));
        } else {
            query.with(Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("_id")));
        }
        query.limit(limit);

        return mongoTemplate.find(query, Moment.class);
    }

    @Override
    public List<Moment> findFeedsByTargetUserKeyset(
            UUID requesterId,
            UUID targetUserId,
            Instant cursorCreatedAt,
            ObjectId cursorId,
            boolean asc,
            int limit
    ) {
        List<ObjectId> firstMomentIdInStory = storyRepository.findLatestMomentIdsByUserIdKeysetLatestMoment(
                targetUserId,
                cursorCreatedAt,
                cursorId,
                asc,
                limit + 1
        );

        UUID connectionId = ConnectionUtils.generateConnectionId(targetUserId, requesterId);
        ConnectionType connectionType = requesterId.equals(targetUserId)
                ? null
                : connectionRepository.findTypeById(connectionId)
                .orElseThrow(() -> new ResourcesAccessDeniedEx("Access denied"));

        List<Visibility> allowedVisibilities = connectionType == null
                ? List.of()
                : switch (connectionType) {
                    case FRIEND -> List.of(Visibility.ALL_FRIENDS);
                    case CLOSE_FRIEND -> List.of(Visibility.ALL_FRIENDS, Visibility.CLOSE_FRIENDS);
                    case SPECIAL ->
                            List.of(Visibility.ALL_FRIENDS, Visibility.CLOSE_FRIENDS, Visibility.PARTNER_ONLY);
                    default -> List.of();
                };

        Criteria baseCriteria = requesterId.equals(targetUserId)
                ? new Criteria().andOperator(
                Criteria.where("deletedAt").is(null),
                new Criteria().orOperator(
                        Criteria.where("storyId").is(null).andOperator(
                                Criteria.where("userId").is(targetUserId)
                        ),
                        Criteria.where("storyId").ne(null).andOperator(
                                Criteria.where("_id").in(firstMomentIdInStory)
                        )
                ))
                : new Criteria().andOperator(
                Criteria.where("deletedAt").is(null),
                new Criteria().orOperator(
                        Criteria.where("storyId").is(null).andOperator(
                                Criteria.where("userId").is(targetUserId)
                                        .andOperator(
                                                Criteria.where("visibility").in(allowedVisibilities)
                                        )
                        ),
                        Criteria.where("storyId").ne(null).andOperator(
                                Criteria.where("_id").in(firstMomentIdInStory)
                        )
                ));


        // 3. Phân trang cursor
        if (cursorCreatedAt != null && cursorId != null) {
            Criteria pagingCriteria;
            if (asc) {
                pagingCriteria = new Criteria().orOperator(
                        Criteria.where("createdAt").gt(cursorCreatedAt),
                        new Criteria().and("createdAt").is(cursorCreatedAt).and("_id").gt(cursorId)
                );
            } else {
                pagingCriteria = new Criteria().orOperator(
                        Criteria.where("createdAt").lt(cursorCreatedAt),
                        new Criteria().and("createdAt").is(cursorCreatedAt).and("_id").lt(cursorId)
                );
            }
            baseCriteria = new Criteria().andOperator(baseCriteria, pagingCriteria);
        }

        Query query = new Query(baseCriteria);
        if (asc) {
            query.with(Sort.by(Sort.Order.asc("createdAt"), Sort.Order.asc("_id")));
        } else {
            query.with(Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("_id")));
        }
        query.limit(limit);

        return mongoTemplate.find(query, Moment.class);

    }

    @Override
    public List<StoryMomentStats> getMomentStatsByStoryIds(Collection<UUID> storyIds) {

        MatchOperation match = Aggregation.match(
                Criteria.where("storyId").in(storyIds)
                        .and("deletedAt").is(null)
        );

        GroupOperation group = Aggregation.group("storyId")
                .count().as("totalMoments")
                .min("createdAt").as("firstCreatedAt")
                .max("createdAt").as("lastCreatedAt");

        ProjectionOperation project = Aggregation.project()
                .and("_id").as("storyId")
                .and("totalMoments").as("totalMoments")
                .and("firstCreatedAt").as("firstCreatedAt")
                .and("lastCreatedAt").as("lastCreatedAt");

        Aggregation agg = Aggregation.newAggregation(match, group, project);

        return mongoTemplate
                .aggregate(agg, "moments", StoryMomentStats.class)
                .getMappedResults();
    }

    @Override
    public Optional<StoryMomentStats> getMomentStatsByStoryId(UUID storyId) {

        MatchOperation match = Aggregation.match(
                Criteria.where("storyId").is(storyId)
                        .and("deletedAt").is(null)
        );

        GroupOperation group = Aggregation.group("storyId")
                .count().as("totalMoments")
                .min("createdAt").as("firstCreatedAt")
                .max("createdAt").as("lastCreatedAt");

        ProjectionOperation project = Aggregation.project()
                .and("_id").as("storyId")
                .and("totalMoments").as("totalMoments")
                .and("firstCreatedAt").as("firstCreatedAt")
                .and("lastCreatedAt").as("lastCreatedAt");

        Aggregation agg = Aggregation.newAggregation(match, group, project);

        StoryMomentStats stats = mongoTemplate
                .aggregate(agg, "moments", StoryMomentStats.class)
                .getUniqueMappedResult();

        return Optional.ofNullable(stats);
    }

    @Override
    public Optional<Moment> findLatestMomentByUserIdAndStoryId(UUID userId, UUID storyId) {
        Criteria criteria = Criteria.where("userId").is(userId)
                .and("storyId").is(storyId)
                .and("deletedAt").is(null);

        Query query = new Query(criteria);
        query.with(Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("_id")));
        query.limit(1);

        Moment latestMoment = mongoTemplate.findOne(query, Moment.class);
        return Optional.ofNullable(latestMoment);
    }

    @Override
    public Optional<Moment> findLatestMomentByStoryIdExcludeUserId(UUID storyId, UUID excludedUserId) {
        Criteria criteria = Criteria.where("storyId").is(storyId)
                .and("userId").ne(excludedUserId)
                .and("deletedAt").is(null);

        Query query = new Query(criteria);
        query.with(Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("_id")));
        query.limit(1);

        Moment latestMoment = mongoTemplate.findOne(query, Moment.class);
        return Optional.ofNullable(latestMoment);
    }



}
