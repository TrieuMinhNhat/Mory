package com.muicochay.mory.moment.service;

import com.fantus.mory.connection.entity.Connection;
import com.fantus.mory.connection.enums.ConnectionStatus;
import com.fantus.mory.connection.enums.ConnectionType;
import com.fantus.mory.connection.repository.ConnectionRepository;
import com.fantus.mory.connection.utils.ConnectionUtils;
import com.fantus.mory.moment.document.Moment;
import com.fantus.mory.moment.document.MomentReaction;
import com.fantus.mory.moment.dto.*;
import com.fantus.mory.moment.repository.MomentRepository;
import com.fantus.mory.shared.dto.UpdateVisibilityRequest;
import com.fantus.mory.shared.enums.ReactionType;
import com.fantus.mory.shared.enums.Visibility;
import com.fantus.mory.shared.exception.global.InvalidArgumentEx;
import com.fantus.mory.shared.exception.global.InvalidResourceStateEx;
import com.fantus.mory.shared.exception.global.ResourcesAccessDeniedEx;
import com.fantus.mory.shared.exception.global.ResourcesNotFoundEx;
import com.fantus.mory.story.entity.Story;
import com.fantus.mory.story.enums.StoryType;
import com.fantus.mory.story.repository.StoryRepository;
import com.fantus.mory.user.dto.UserPreviewResponse;
import com.fantus.mory.user.entity.User;
import com.fantus.mory.user.entity.UserProfile;
import com.fantus.mory.user.mapper.UserMapper;
import com.fantus.mory.user.repositoriy.UserProfileRepository;
import com.fantus.mory.user.repositoriy.UserRepository;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class MomentService {
    private final MomentRepository momentRepository;

    private final MomentReactionService momentReactionService;

    private final ConnectionRepository connectionRepository;
    private final StoryRepository storyRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserMapper userMapper;


    @Transactional
    public MomentResponse createStandaloneMoment(UUID userId, StandaloneMomentRequest request) {
        if (request.getMediaUrl().isBlank()) {
            throw new InvalidArgumentEx("MediaUrl is empty");
        }
        User user = userRepository.findWithProfileById(userId)
                .orElseThrow(() -> new ResourcesNotFoundEx("User not found with Id: " + userId));

        Moment moment = buildStandaloneMoment(user, request);
        momentRepository.save(moment);

        return toResponse(moment, user, null);
    }

    @Transactional
    public MomentResponse createMomentInStory(UUID userId, UUID storyId, StoryMomentRequest request) {
        if (request.getMediaUrl().isBlank()) {
            throw new InvalidArgumentEx("MediaFile is empty");
        }

        User user = userRepository.findWithProfileById(userId)
                .orElseThrow(() -> new ResourcesNotFoundEx("User not found with Id: " + userId));

        Story story = storyRepository.findActiveById(storyId)
                .orElseThrow(() -> new ResourcesNotFoundEx("Story not found with Id: " + storyId));

        boolean allowed = switch (story.getType()) {
            case BEFORE_AFTER, CHALLENGE -> story.getCreator().getId().equals(userId);
            case JOURNEY, ALBUM -> story.getCreator().getId().equals(userId) ||
                    story.getMembers().stream().anyMatch(m -> m.getUser().getId().equals(userId));
        };
        if (!allowed) {
            throw new ResourcesAccessDeniedEx("You are not allowed to post in this story");
        }

        Moment moment = switch (story.getType()) {
            case BEFORE_AFTER -> buildBeforeAfterMoment(user, story, request);
            case JOURNEY      -> buildJourneyMoment(user, story, request);
            case CHALLENGE    -> buildChallengeMoment(user, story, request);
            case ALBUM        -> buildAlbumMoment(user, story, request);
        };
        momentRepository.save(moment);
        story.setLatestMomentId(moment.getId());
        story.setLatestMomentCreatedAt(moment.getCreatedAt());
        return toResponse(moment, user, story);
    }

    private Moment buildStandaloneMoment(User user, StandaloneMomentRequest request) {
        Moment moment = Moment.builder()
                .userId(user.getId())
                .mediaUrl(request.getMediaUrl())
                .audioUrl(request.getAudioUrl())
                .caption(request.getCaption())
                .visibility(request.getVisibility() != null ? request.getVisibility() : Visibility.ALL_FRIENDS)
                .milestone(request.isMilestone())
                .tags(new ArrayList<>())
                .build();

        attachTags(moment, user.getId(), request.getTaggedUserIds());
        return moment;
    }

    private void attachTags(Moment moment, UUID creatorId, List<UUID> taggedUserIds) {
        if (taggedUserIds == null || taggedUserIds.isEmpty()) return;

        Set<UUID> existingIds = new HashSet<>(moment.getTags());

        Set<UUID> newIds = taggedUserIds.stream()
                .filter(Objects::nonNull)
                .filter(id -> !existingIds.contains(id))
                .collect(Collectors.toSet());

        if (newIds.isEmpty()) return;

        Set<UUID> allowedIds = connectionRepository.findConnectedUserIds(
                creatorId, newIds, List.of(ConnectionStatus.CONNECTED)
        );
        allowedIds.forEach(userId -> moment.getTags().add(userId));
    }

    private Moment buildBeforeAfterMoment(User user, Story story, StoryMomentRequest request) {
        if (story.isHasBefore() && story.isHasAfter()) {
            throw new InvalidResourceStateEx("This story already has BEFORE and AFTER moments.");
        }

        Moment moment = Moment.builder()
                .storyId(story.getId())
                .userId(user.getId())
                .mediaUrl(request.getMediaUrl())
                .audioUrl(request.getAudioUrl())
                .visibility(story.getVisibility())
                .caption(request.getCaption())
                .position(!story.isHasBefore() ? 0 : 1)
                .build();

        attachTags(moment, user.getId(), request.getTaggedUserIds());

        if (!story.isHasBefore()) {
            story.setHasBefore(true);
        } else {
            story.setHasAfter(true);
        }

        momentRepository.save(moment);
        return moment;
    }

    private Moment buildJourneyMoment(User user, Story story, StoryMomentRequest request) {
        LocalDate today = LocalDate.now(ZoneId.of(user.getProfile().getTimezone()));

        if (today.isBefore(story.getStartDate())) {
            throw new InvalidResourceStateEx("Journey has not started yet.");
        }
        if (story.getEndDate() != null && today.isAfter(story.getEndDate())) {
            throw new InvalidResourceStateEx("Journey has already ended.");
        }

        int dayIndex = (int) ChronoUnit.DAYS.between(story.getStartDate(), today) + 1;

        Moment moment = Moment.builder()
                .storyId(story.getId())
                .userId(user.getId())
                .mediaUrl(request.getMediaUrl())
                .audioUrl(request.getAudioUrl())
                .visibility(story.getVisibility())
                .caption(request.getCaption())
                .dayIndex(dayIndex)
                .build();

        attachTags(moment, user.getId(), request.getTaggedUserIds());

        momentRepository.save(moment);

        return moment;
    }

    private Moment buildChallengeMoment(User user, Story story, StoryMomentRequest request) {
        ZoneId zoneId = ZoneId.of(user.getProfile().getTimezone());
        LocalDate today = LocalDate.now(zoneId);

        if (today.isBefore(story.getStartDate())) {
            throw new InvalidResourceStateEx("Challenge has not started yet.");
        }
        if (story.getEndDate() != null && today.isAfter(story.getEndDate())) {
            throw new InvalidResourceStateEx("Challenge has already ended.");
        }

        int count = momentRepository.countByStoryIdAndUserIdAndDeletedAtIsNull(story.getId(), user.getId());
        boolean existsToday = momentRepository.existsByStoryIdAndUserIdAndDateAndDeletedAtIsNull(story.getId(), user.getId(), today);

        int dayIndex = count + 1;
        if (dayIndex > story.getDuration()) {
            throw new InvalidResourceStateEx("You already completed this challenge.");
        }
        if (existsToday) {
            throw new InvalidResourceStateEx("You already posted a moment today.");
        }

        Moment moment = Moment.builder()
                .storyId(story.getId())
                .userId(user.getId())
                .mediaUrl(request.getMediaUrl())
                .audioUrl(request.getAudioUrl())
                .visibility(story.getVisibility())
                .caption(request.getCaption())
                .dayIndex(dayIndex)
                .date(today)
                .build();

        attachTags(moment, user.getId(), request.getTaggedUserIds());

        momentRepository.save(moment);

        return moment;
    }

    private Moment buildAlbumMoment(User user, Story story, StoryMomentRequest request) {
        Moment moment = Moment.builder()
                .storyId(story.getId())
                .userId(user.getId())
                .mediaUrl(request.getMediaUrl())
                .audioUrl(request.getAudioUrl())
                .visibility(story.getVisibility())
                .caption(request.getCaption())
                .build();

        attachTags(moment, user.getId(), request.getTaggedUserIds());

        momentRepository.save(moment);

        return moment;
    }

    @Transactional
    public void deleteMoment(UUID userId, ObjectId momentId) {
        Moment moment = momentRepository.findByIdAndDeletedAtIsNull(momentId)
                .orElseThrow(() -> new ResourcesNotFoundEx("Moment not found with Id: " + momentId));

        if (!moment.getUserId().equals(userId)) {
            throw new ResourcesAccessDeniedEx("You cannot delete someone else's moment");
        }

        if (moment.getStoryId() != null) {
            Story story = storyRepository.findById(moment.getStoryId())
                    .orElseThrow(() -> new ResourcesNotFoundEx("Story not found with Id: " + moment.getStoryId()));
            if (story.getType() == StoryType.BEFORE_AFTER) throw new ResourcesAccessDeniedEx("Cannot delete moment in BEFORE/AFTER story.");
        }

        moment.setDeletedAt(Instant.now());
        momentRepository.save(moment);
    }

    @Transactional
    public MomentResponse updateMomentMilestone(UUID userId, ObjectId momentId, boolean milestone) {
        Moment moment = momentRepository.findByIdAndDeletedAtIsNull(momentId)
                .orElseThrow(() -> new ResourcesNotFoundEx("Moment not found with Id: " + momentId));

        if (!moment.getUserId().equals(userId)) {
            throw new ResourcesAccessDeniedEx("You cannot update someone else's moment");
        }

        if (moment.isMilestone() == milestone) {
            throw new InvalidArgumentEx(
                    milestone
                            ? "Moment is already marked as milestone"
                            : "Moment is not currently a milestone"
            );
        }

        moment.setMilestone(milestone);
        momentRepository.save(moment);
        return MomentResponse.builder()
                .milestone(moment.isMilestone())
                .build();
    }

    @Transactional
    public MomentResponse updateMomentVisibility(UUID userId, ObjectId momentId, UpdateVisibilityRequest request) {
        Moment moment = momentRepository.findByIdAndDeletedAtIsNull(momentId)
                .orElseThrow(() -> new ResourcesNotFoundEx("Moment not found with Id: " + momentId));

        if (!moment.getUserId().equals(userId)) {
            throw new ResourcesAccessDeniedEx("You cannot update someone else's moment");
        }

        if (moment.getStoryId() != null) {
            throw new InvalidResourceStateEx("Cannot change visibility of a moment that belongs to a story");
        }

        if (moment.getVisibility() == request.getVisibility()) {
            throw new InvalidArgumentEx("The moment is already set to visibility: " + request.getVisibility());
        }

        moment.setVisibility(request.getVisibility());
        momentRepository.save(moment);

        return MomentResponse.builder()
                .visibility(moment.getVisibility())
                .build();
    }

    @Transactional
    public MomentResponse addTags(UUID userId, ObjectId momentId, List<UUID> taggedUserIds) {
        Moment moment = momentRepository.findByIdAndDeletedAtIsNull(momentId)
                .orElseThrow(() -> new ResourcesNotFoundEx("Moment not found"));

        if (!moment.getUserId().equals(userId)) {
            throw new ResourcesAccessDeniedEx("You cannot modify someone else's moment");
        }

        attachTags(moment, userId, taggedUserIds);

        return MomentResponse.builder()
                .tags(moment.getTags())
                .build();
    }

    @Transactional
    public MomentResponse removeTags(UUID userId, ObjectId momentId, List<UUID> tagIds) {
        Moment moment = momentRepository.findByIdAndDeletedAtIsNull(momentId)
                .orElseThrow(() -> new ResourcesNotFoundEx("Moment not found"));

        if (!moment.getUserId().equals(userId)) {
            throw new ResourcesAccessDeniedEx("You cannot modify someone else's moment");
        }
        moment.getTags().removeIf(tagIds::contains);
        return MomentResponse.builder()
                .tags(moment.getTags())
                .build();
    }

    @Transactional(readOnly = true)
    public MomentPageResponse getUserMoments(
            UUID requesterId,
            UUID userId,
            Instant cursorCreatedAt,
            ObjectId cursorId,
            String order,
            int size
    ) {
        List<Moment> moments;
        boolean asc = "ASC".equalsIgnoreCase(order);
        if (requesterId.equals(userId)) {
            moments = momentRepository.findMomentsKeyset(userId, cursorCreatedAt, cursorId, asc,size + 1);
        } else {
            UUID connectionId = ConnectionUtils.generateConnectionId(requesterId, userId);
            Connection connection = connectionRepository.findById(connectionId)
                    .orElseThrow(() -> new ResourcesAccessDeniedEx("Connection not found or you do not have access"));
            if (connection.getConnectionType() == ConnectionType.NO_RELATION || connection.getStatus() != ConnectionStatus.CONNECTED) {
                throw new ResourcesAccessDeniedEx("Connection not found or you do not have access");
            }
            List<Visibility> allowedVisibilities = connection.getConnectionType().getAllowedVisibilities();
            moments = momentRepository.findVisibleMomentsKeyset(
                    userId,
                    requesterId,
                    allowedVisibilities,
                    cursorCreatedAt,
                    cursorId,
                    asc,
                    size + 1
            );
        }

        boolean hasNext = moments.size() > size;
        if (hasNext) moments = moments.subList(0, size);
        Instant nextCursorCreatedAt = hasNext ? moments.getLast().getCreatedAt() : null;
        ObjectId nextCursorId = hasNext ? moments.getLast().getId() : null;

        List<UUID> storyIds = moments.stream()
                .map(Moment::getStoryId)
                .filter(Objects::nonNull)
                .toList();

        List<Story> stories = storyRepository.findAllById(storyIds);
        Map<UUID, Story> storyMap = stories.stream()
                .collect(Collectors.toMap(Story::getId, story -> story));

        User user = userRepository.findWithProfileById(userId)
                .orElseThrow(() -> new ResourcesNotFoundEx("User not found with id: " + userId));

        List<MomentResponse> responses = moments.stream()
                .map(m -> toResponse(
                        m,
                        user,
                        storyMap.get(m.getStoryId())
                ))
                .toList();

        List<ObjectId> momentIdsForReaction = responses.stream()
                .map(m -> new ObjectId(m.getId()))
                .toList();

        List<MomentReaction> reactions = momentReactionService.getReactionsForMoments(momentIdsForReaction);

        Map<ObjectId, MomentReaction> reactionMap = reactions.stream()
                .collect(Collectors.toMap(MomentReaction::getMomentId, r -> r));

        Map<ObjectId, ReactionType> myReactionMap = new HashMap<>();
        for (MomentReaction r : reactions) {
            ReactionType myReaction = r.getUserReactions() != null ? r.getUserReactions().get(requesterId) : null;
            if (myReaction != null) {
                myReactionMap.put(r.getMomentId(), myReaction);
            }
        }

        Set<UUID> allUserIds = new HashSet<>();
        Map<ObjectId, List<UUID>> momentIdToUserIds = new HashMap<>();

        for (MomentReaction reaction : reactions) {
            List<UUID> userReactionIds = reaction.getUserReactions().keySet().stream()
                    .limit(3)
                    .toList();
            momentIdToUserIds.put(reaction.getMomentId(), userReactionIds);
            allUserIds.addAll(userReactionIds);
        }


        List<UserProfile> profiles = userProfileRepository.findAllByUserIds(new ArrayList<>(allUserIds));

        Map<UUID, UserPreviewResponse> userPreviewMap = profiles.stream()
                .collect(Collectors.toMap(
                        p -> p.getUser().getId(),
                        p -> UserPreviewResponse.builder()
                                .id(p.getUser().getId())
                                .displayName(p.getDisplayName())
                                .avatarUrl(p.getAvatarUrl())
                                .build()
                ));


        responses.forEach(response -> {
            ObjectId momentId = new ObjectId(response.getId());

            if (response.getUser().getId().equals(requesterId)) {
                MomentReaction doc = reactionMap.get(momentId);
                if (doc != null) {
                    response.setTotalReactions(doc.getTotalReactions());

                    List<UUID> userIdsForReaction = momentIdToUserIds.getOrDefault(momentId, List.of());
                    List<ReactionPreviewDto> previews = userIdsForReaction.stream()
                            .map(userPreviewMap::get)
                            .filter(Objects::nonNull)
                            .map(userPreview -> ReactionPreviewDto.builder()
                                    .user(userPreview)
                                    .reactionType(doc.getUserReactions().get(userPreview.getId()))
                                    .build())
                            .toList();

                    response.setReactionPreviews(previews);
                } else {
                    response.setTotalReactions(0);
                    response.setReactionPreviews(Collections.emptyList());
                }
                response.setMyReaction(null);
            } else {
                response.setTotalReactions(0);
                response.setReactionPreviews(Collections.emptyList());

                response.setMyReaction(myReactionMap.get(momentId));
            }
        });
        return MomentPageResponse.builder()
                .moments(responses)
                .hasNext(hasNext)
                .nextCursorCreatedAt(nextCursorCreatedAt)
                .nextCursorId(nextCursorId)
                .build();
    }

    @Transactional(readOnly = true)
    public MomentPageResponse getHomeFeedMoments(
            UUID requesterId,
            Instant cursorCreatedAt,
            ObjectId cursorId,
            String order,
            int size,
            UUID targetUserId
    ) {
        boolean asc = "ASC".equalsIgnoreCase(order);
        List<Moment> moments = targetUserId == null
                ? momentRepository.findFeedsKeyset(
                    requesterId, cursorCreatedAt, cursorId, asc, size + 1)
                : momentRepository.findFeedsByTargetUserKeyset(requesterId, targetUserId, cursorCreatedAt, cursorId, asc, size + 1);

        boolean hasNext = moments.size() > size;
        if (hasNext) moments = moments.subList(0, size);
        Instant nextCursorCreatedAt = hasNext ? moments.getLast().getCreatedAt() : null;
        ObjectId nextCursorId = hasNext ? moments.getLast().getId() : null;

        List<UUID> storyIds = moments.stream()
                .map(Moment::getStoryId)
                .filter(Objects::nonNull)
                .toList();

        List<Story> stories = storyRepository.findAllById(storyIds);
        Map<UUID, Story> storyMap = stories.stream()
                .collect(Collectors.toMap(Story::getId, story -> story));

        List<UUID> userIds = moments.stream()
                .map(Moment::getUserId)
                .toList();

        List<User> users = userRepository.findAllWithProfileByIds(userIds);
        Map<UUID, User> userMap = users.stream()
                .collect(Collectors.toMap(User::getId, user -> user));


        List<MomentResponse> responses = moments.stream()
                .map(m -> toResponse(
                        m,
                        userMap.get(m.getUserId()),
                        storyMap.get(m.getStoryId())
                ))
                .toList();
        Map<ObjectId, UUID> momentIdToOwnerId = moments.stream()
                .collect(Collectors.toMap(Moment::getId, Moment::getUserId));

        // Lấy reactions 1 lần cho tất cả moment
        List<ObjectId> allMomentIds = moments.stream().map(Moment::getId).toList();

        List<MomentReaction> allReactions = allMomentIds.isEmpty()
                ? List.of()
                : momentReactionService.getReactionsForMoments(allMomentIds);

        Map<ObjectId, MomentReaction> reactionMap = allReactions.stream()
                .collect(Collectors.toMap(MomentReaction::getMomentId, r -> r));

        Map<ObjectId, ReactionType> myReactionMap = new HashMap<>();
        Set<UUID> allUserIds = new HashSet<>();
        Map<ObjectId, List<UUID>> momentIdToUserIds = new HashMap<>();

        for (MomentReaction reaction : allReactions) {
            ObjectId momentId = reaction.getMomentId();
            UUID ownerId = momentIdToOwnerId.get(momentId);

            if (reaction.getUserReactions() != null) {
                ReactionType myReaction = reaction.getUserReactions().get(requesterId);
                if (myReaction != null) {
                    myReactionMap.put(momentId, myReaction);
                }

                if (ownerId != null && ownerId.equals(requesterId)) {
                    List<UUID> userReactionIds = reaction.getUserReactions().keySet().stream()
                            .limit(3)
                            .toList();
                    momentIdToUserIds.put(momentId, userReactionIds);
                    allUserIds.addAll(userReactionIds);
                }
            }
        }

        List<UserProfile> profiles = allUserIds.isEmpty()
                ? List.of()
                : userProfileRepository.findAllByUserIds(new ArrayList<>(allUserIds));

        Map<UUID, UserPreviewResponse> userPreviewMap = profiles.stream()
                .collect(Collectors.toMap(
                        p -> p.getUser().getId(),
                        p -> UserPreviewResponse.builder()
                                .id(p.getUser().getId())
                                .displayName(p.getDisplayName())
                                .avatarUrl(p.getAvatarUrl())
                                .build()
                ));

        // Gán dữ liệu cho response
        responses.forEach(response -> {
            ObjectId momentId = new ObjectId(response.getId());

            if (response.getUser().getId().equals(requesterId)) {
                MomentReaction doc = reactionMap.get(momentId);
                if (doc != null) {
                    response.setTotalReactions(doc.getTotalReactions());

                    List<UUID> userIdsForReaction = momentIdToUserIds.getOrDefault(momentId, List.of());
                    List<ReactionPreviewDto> previews = userIdsForReaction.stream()
                            .map(userPreviewMap::get)
                            .filter(Objects::nonNull)
                            .map(userPreview -> ReactionPreviewDto.builder()
                                    .user(userPreview)
                                    .reactionType(doc.getUserReactions().get(userPreview.getId()))
                                    .build())
                            .toList();

                    response.setReactionPreviews(previews);
                } else {
                    response.setTotalReactions(0);
                    response.setReactionPreviews(Collections.emptyList());
                }
                response.setMyReaction(null);
            } else {
                response.setTotalReactions(0);
                response.setReactionPreviews(Collections.emptyList());

                response.setMyReaction(myReactionMap.get(momentId));
            }
        });

        return MomentPageResponse.builder()
                .moments(responses)
                .hasNext(hasNext)
                .nextCursorCreatedAt(nextCursorCreatedAt)
                .nextCursorId(nextCursorId)
                .build();
    }

    @Transactional(readOnly = true)
    public MomentPageResponse getMomentsByStoryId(
            UUID requesterId,
            UUID storyId,
            Instant cursorCreatedAt,
            ObjectId cursorId,
            String order,
            int size
    ) {
        Story story = storyRepository.findByIdWithMembers(storyId)
                .orElseThrow(() -> new ResourcesNotFoundEx("Story not found with Id: " + storyId));

        boolean isCreator = requesterId.equals(story.getCreator().getId());
        boolean isMember = story.getMembers().stream()
                .anyMatch(m -> m.getUser().getId().equals(requesterId));

        if (!isCreator && !isMember) {
            List<UUID> relatedUserIds = Stream.concat(
                    story.getMembers().stream().map(m -> m.getUser().getId()),
                    Stream.of(story.getCreator().getId())
            ).toList();

            List<UUID> connectionIds = relatedUserIds.stream()
                    .map(userId -> ConnectionUtils.generateConnectionId(requesterId, userId))
                    .toList();

            boolean hasConnection = connectionRepository.existsAnyConnectionByIds(
                    connectionIds,
                    List.of(ConnectionStatus.CONNECTED.name())
            );

            if (!hasConnection) {
                throw new ResourcesAccessDeniedEx("You do not have access to this story's moments");
            }
        }

        boolean asc = "ASC".equalsIgnoreCase(order);

        List<Moment> moments = momentRepository.findByStoryIdKeySet(storyId, cursorCreatedAt, cursorId, asc, size + 1);

        boolean hasNext = moments.size() > size;
        if (hasNext) moments = moments.subList(0, size);
        Instant nextCursorCreatedAt = hasNext ? moments.getLast().getCreatedAt() : null;
        ObjectId nextCursorId = hasNext ? moments.getLast().getId() : null;

        List<UUID> storyIds = moments.stream()
                .map(Moment::getStoryId)
                .filter(Objects::nonNull)
                .toList();

        List<UUID> userIds = moments.stream()
                .map(Moment::getUserId)
                .toList();

        List<User> users = userRepository.findAllWithProfileByIds(userIds);
        Map<UUID, User> userMap = users.stream()
                .collect(Collectors.toMap(User::getId, user -> user));


        List<MomentResponse> responses = moments.stream()
                .map(m -> toResponse(
                        m,
                        userMap.get(m.getUserId()),
                        null
                ))
                .toList();

        Map<ObjectId, UUID> momentIdToOwnerId = responses.stream()
                .collect(Collectors.toMap(r -> new ObjectId(r.getId()), r -> r.getUser().getId()));

        // Lấy reactions 1 lần cho tất cả moment
        List<ObjectId> allMomentIds = responses.stream().map(m -> new ObjectId(m.getId())).toList();
        List<MomentReaction> allReactions = allMomentIds.isEmpty()
                ? List.of()
                : momentReactionService.getReactionsForMoments(allMomentIds);

        Map<ObjectId, MomentReaction> reactionMap = allReactions.stream()
                .collect(Collectors.toMap(MomentReaction::getMomentId, r -> r));

        Map<ObjectId, ReactionType> myReactionMap = new HashMap<>();
        Set<UUID> allUserIds = new HashSet<>();
        Map<ObjectId, List<UUID>> momentIdToUserIds = new HashMap<>();

        for (MomentReaction reaction : allReactions) {
            ObjectId momentId = reaction.getMomentId();
            UUID ownerId = momentIdToOwnerId.get(momentId);

            if (reaction.getUserReactions() != null) {
                ReactionType myReaction = reaction.getUserReactions().get(requesterId);
                if (myReaction != null) {
                    myReactionMap.put(momentId, myReaction);
                }

                if (ownerId != null && ownerId.equals(requesterId)) {
                    List<UUID> userReactionIds = reaction.getUserReactions().keySet().stream()
                            .limit(3)
                            .toList();
                    momentIdToUserIds.put(momentId, userReactionIds);
                    allUserIds.addAll(userReactionIds);
                }
            }
        }

        List<UserProfile> profiles = allUserIds.isEmpty()
                ? List.of()
                : userProfileRepository.findAllByUserIds(new ArrayList<>(allUserIds));

        Map<UUID, UserPreviewResponse> userPreviewMap = profiles.stream()
                .collect(Collectors.toMap(
                        p -> p.getUser().getId(),
                        p -> UserPreviewResponse.builder()
                                .id(p.getUser().getId())
                                .displayName(p.getDisplayName())
                                .avatarUrl(p.getAvatarUrl())
                                .build()
                ));

        // Gán dữ liệu cho response
        responses.forEach(response -> {
            ObjectId momentId = new ObjectId(response.getId());

            if (response.getUser().getId().equals(requesterId)) {
                MomentReaction doc = reactionMap.get(momentId);
                if (doc != null) {
                    response.setTotalReactions(doc.getTotalReactions());

                    List<UUID> userIdsForReaction = momentIdToUserIds.getOrDefault(momentId, List.of());
                    List<ReactionPreviewDto> previews = userIdsForReaction.stream()
                            .map(userPreviewMap::get)
                            .filter(Objects::nonNull)
                            .map(userPreview -> ReactionPreviewDto.builder()
                                    .user(userPreview)
                                    .reactionType(doc.getUserReactions().get(userPreview.getId()))
                                    .build())
                            .toList();

                    response.setReactionPreviews(previews);
                } else {
                    response.setTotalReactions(0);
                    response.setReactionPreviews(Collections.emptyList());
                }
                response.setMyReaction(null);
            } else {
                response.setTotalReactions(0);
                response.setReactionPreviews(Collections.emptyList());

                response.setMyReaction(myReactionMap.get(momentId));
            }
        });

        return MomentPageResponse.builder()
                .moments(responses)
                .hasNext(hasNext)
                .nextCursorCreatedAt(nextCursorCreatedAt)
                .nextCursorId(nextCursorId)
                .build();
    }

    @Transactional
    public MomentReactionDto toggleReaction(UUID userId, ObjectId momentId, ReactionType reactionType) {
        Moment moment = momentRepository.findByIdAndDeletedAtIsNull(momentId)
                .orElseThrow(() -> new ResourcesNotFoundEx("Moment not found with Id: " + momentId));

        if (moment.getUserId().equals(userId)) {
            throw new InvalidResourceStateEx("You cannot react to your own moment");
        }

        UUID connectionId = ConnectionUtils.generateConnectionId(moment.getUserId(), userId);
        Connection connection = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new ResourcesAccessDeniedEx("Access denied: no connection found"));
        if (connection.getConnectionType() == ConnectionType.NO_RELATION || connection.getStatus() != ConnectionStatus.CONNECTED) {
            throw new ResourcesAccessDeniedEx("Access denied: no connection found");
        }

        MomentReaction updated = momentReactionService.toggleReaction(userId, momentId, reactionType);

        ReactionType userReaction = updated.getUserReactions().get(userId);

        return MomentReactionDto.builder()
                .momentId(momentId)
                .userReaction(userReaction)
                .build();
    }

    @Transactional(readOnly = true)
    public MomentReactionResponse getMomentReaction(UUID userId, ObjectId momentId) {
        Moment moment = momentRepository.findByIdAndDeletedAtIsNull(momentId)
                .orElseThrow(() -> new ResourcesNotFoundEx("Moment not found with Id: " + momentId));

        if (!moment.getUserId().equals(userId)) {
            throw new ResourcesAccessDeniedEx("You do not have access to this moment");
        }

        MomentReaction reactions = momentReactionService.getMomentReactions(momentId);
        if (reactions == null || reactions.getUserReactions() == null || reactions.getUserReactions().isEmpty()) {
            return MomentReactionResponse.builder()
                    .reactions(List.of())
                    .build();
        }

        List<UUID> userIds = new ArrayList<>(reactions.getUserReactions().keySet());

        // Query lấy thông tin profile của họ
        List<UserProfile> profiles = userProfileRepository.findAllByUserIds(userIds);

        Map<UUID, UserPreviewResponse> userPreviewMap = profiles.stream()
                .collect(Collectors.toMap(
                        p -> p.getUser().getId(),
                        p -> UserPreviewResponse.builder()
                                .id(p.getUser().getId())
                                .displayName(p.getDisplayName())
                                .avatarUrl(p.getAvatarUrl())
                                .build()
                ));

        List<ReactionPreviewDto> previews = userIds.stream()
                .map(uid -> {
                    UserPreviewResponse user = userPreviewMap.get(uid);
                    if (user == null) return null;
                    ReactionType reactionType = reactions.getUserReactions().get(uid);
                    return ReactionPreviewDto.builder()
                            .user(user)
                            .reactionType(reactionType)
                            .build();
                })
                .filter(Objects::nonNull)
                .toList();

        return MomentReactionResponse.builder()
                .reactions(previews)
                .build();
    }



    private MomentResponse toResponse(Moment moment, User user, Story story) {
        MomentStoryDto storyDto = story != null
                ? MomentStoryDto.builder()
                .id(story.getId())
                .type(story.getType())
                .scope(story.getScope())
                .title(story.getTitle())
                .duration(story.getDuration())
                .build()
                : null;

        UserPreviewResponse userDto = userMapper.toProfilePreview(user);

        return MomentResponse.builder()
                .id(moment.getId().toHexString())
                .story(storyDto)
                .user(userDto)
                .mediaUrl(moment.getMediaUrl())
                .audioUrl(moment.getAudioUrl())
                .visibility(moment.getVisibility())
                .caption(moment.getCaption())
                .position(moment.getPosition())
                .dayIndex(moment.getDayIndex())
                .createdAt(moment.getCreatedAt())
                .lastModifiedAt(moment.getLastModifiedAt())
                .tags(Collections.emptyList())
                .milestone(moment.isMilestone())
                .build();
    }
}
