package com.muicochay.mory.moment.service;

import com.muicochay.mory.connection.entity.Connection;
import com.muicochay.mory.connection.enums.ConnectionType;
import com.muicochay.mory.moment.dto.*;
import com.muicochay.mory.moment.entity.Moment;
import com.muicochay.mory.moment.interfaces.ChallengeProgressProjection;
import com.muicochay.mory.shared.dto.UpdateVisibilityRequest;
import com.muicochay.mory.shared.enums.ReactionType;
import com.muicochay.mory.shared.enums.Visibility;
import com.muicochay.mory.moment.repository.MomentRepository;
import com.muicochay.mory.connection.enums.ConnectionStatus;
import com.muicochay.mory.connection.repository.ConnectionRepository;
import com.muicochay.mory.connection.utils.ConnectionUtils;
import com.muicochay.mory.shared.exception.global.*;
import com.muicochay.mory.story.dto.StoryPreviewDto;
import com.muicochay.mory.story.entity.Story;
import com.muicochay.mory.story.enums.StoryType;
import com.muicochay.mory.story.repository.StoryRepository;
import com.muicochay.mory.user.dto.UserPreviewResponse;
import com.muicochay.mory.user.entity.User;
import com.muicochay.mory.user.entity.UserProfile;
import com.muicochay.mory.user.mapper.UserMapper;
import com.muicochay.mory.user.repositoriy.UserProfileRepository;
import com.muicochay.mory.user.repositoriy.UserRepository;
import lombok.RequiredArgsConstructor;

import lombok.extern.slf4j.Slf4j;
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
@Slf4j
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

        return toResponse(moment);
    }

    @Transactional
    public MomentResponse createMomentInStory(UUID userId, UUID storyId, StoryMomentRequest request) {
        if (request.getMediaUrl().isBlank()) {
            throw new InvalidArgumentEx("MediaFile is empty");
        }

        User user = userRepository.findWithProfileById(userId)
                .orElseThrow(() -> new ResourcesNotFoundEx("User not found with Id: " + userId));

        Story story = storyRepository.findByIdWithMembers(storyId)
                .orElseThrow(() -> new ResourcesNotFoundEx("Story not found with Id: " + storyId));

        boolean allowed = switch (story.getType()) {
            case BEFORE_AFTER, CHALLENGE -> story.getCreator().getId().equals(userId);
            case JOURNEY, ALBUM -> story.getCreator().getId().equals(userId) ||
                    story.getMembers().stream().anyMatch(m -> m.getUser().getId().equals(userId));
        };
        if (!allowed) {
            throw new ResourcesAccessDeniedEx("You are not allowed to post in this story");
        }

        String timezone = user.getProfile().getTimezone();

        Moment moment = switch (story.getType()) {
            case BEFORE_AFTER -> buildBeforeAfterMoment(user, story, request);
            case JOURNEY      -> buildJourneyMoment(user, timezone, story, request);
            case CHALLENGE    -> buildChallengeMoment(user, timezone, story, request);
            case ALBUM        -> buildAlbumMoment(user, story, request);
        };
        momentRepository.save(moment);

        return toResponse(moment);
    }

    private Moment buildStandaloneMoment(User user, StandaloneMomentRequest request) {
        return Moment.builder()
                .user(user)
                .mediaUrl(request.getMediaUrl())
                .audioUrl(request.getAudioUrl())
                .caption(request.getCaption())
                .visibility(request.getVisibility() != null ? request.getVisibility() : Visibility.ALL_FRIENDS)
                .isMilestone(request.isMilestone())
                .build();
    }

    private Moment buildBeforeAfterMoment(User user, Story story, StoryMomentRequest request) {
        if (story.isHasBefore() && story.isHasAfter()) {
            throw new InvalidResourceStateEx("This story already has BEFORE and AFTER moments.");
        }

        Moment moment = Moment.builder()
                .story(story)
                .user(user)
                .mediaUrl(request.getMediaUrl())
                .audioUrl(request.getAudioUrl())
                .visibility(story.getVisibility())
                .caption(request.getCaption())
                .position(!story.isHasBefore() ? 0 : 1)
                .build();

        if (!story.isHasBefore()) {
            story.setHasBefore(true);
        } else {
            story.setHasAfter(true);
        }


        return moment;
    }

    private Moment buildJourneyMoment(User user, String timezone, Story story, StoryMomentRequest request) {
        LocalDate today = LocalDate.now(ZoneId.of(timezone));

        if (today.isBefore(story.getStartDate())) {
            throw new InvalidResourceStateEx("Journey has not started yet.");
        }
        if (story.getEndDate() != null && today.isAfter(story.getEndDate())) {
            throw new InvalidResourceStateEx("Journey has already ended.");
        }

        int dayIndex = (int) ChronoUnit.DAYS.between(story.getStartDate(), today) + 1;

        return Moment.builder()
                .story(story)
                .user(user)
                .mediaUrl(request.getMediaUrl())
                .audioUrl(request.getAudioUrl())
                .visibility(story.getVisibility())
                .caption(request.getCaption())
                .dayIndex(dayIndex)
                .build();
    }

    private Moment buildChallengeMoment(User user, String timezone, Story story, StoryMomentRequest request) {
        ZoneId zoneId = ZoneId.of(timezone);
        LocalDate today = LocalDate.now(zoneId);

        if (today.isBefore(story.getStartDate())) {
            throw new InvalidResourceStateEx("Challenge has not started yet.");
        }
        if (story.getEndDate() != null && today.isAfter(story.getEndDate())) {
            throw new InvalidResourceStateEx("Challenge has already ended.");
        }

        ChallengeProgressProjection progress = momentRepository.getChallengeProgress(story.getId(), user.getId(), today);

        int count = (int) progress.getTotal();
        boolean existsToday = progress.getExistsToday();

        int dayIndex = count + 1;
        if (dayIndex > story.getDuration()) {
            throw new InvalidResourceStateEx("You already completed this challenge.");
        }
        if (existsToday) {
            throw new InvalidResourceStateEx("You already posted a moment today.");
        }


        return Moment.builder()
                .story(story)
                .user(user)
                .mediaUrl(request.getMediaUrl())
                .audioUrl(request.getAudioUrl())
                .visibility(story.getVisibility())
                .caption(request.getCaption())
                .dayIndex(dayIndex)
                .date(today)
                .build();
    }

    private Moment buildAlbumMoment(User user, Story story, StoryMomentRequest request) {
        return Moment.builder()
                .story(story)
                .user(user)
                .mediaUrl(request.getMediaUrl())
                .audioUrl(request.getAudioUrl())
                .visibility(story.getVisibility())
                .caption(request.getCaption())
                .build();
    }

    @Transactional
    public void deleteMoment(UUID userId, UUID momentId) {
        Moment moment = momentRepository.findByIdAndDeletedAtIsNull(momentId)
                .orElseThrow(() -> new ResourcesNotFoundEx("Moment not found with Id: " + momentId));

        if (!moment.getUser().getId().equals(userId)) {
            throw new ResourcesAccessDeniedEx("You cannot delete someone else's moment");
        }

        if (moment.getStory() != null
                && moment.getStory().getType() == StoryType.BEFORE_AFTER) {
            throw new ResourcesAccessDeniedEx("Cannot delete moment in BEFORE/AFTER story.");

        }

        // Soft delete
        moment.setDeletedAt(Instant.now());
    }

    @Transactional
    public MomentResponse updateMomentMilestone(UUID userId, UUID momentId, boolean milestone) {
        Moment moment = momentRepository.findByIdAndDeletedAtIsNull(momentId)
                .orElseThrow(() -> new ResourcesNotFoundEx("Moment not found with Id: " + momentId));

        if (!moment.getUser().getId().equals(userId)) {
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

        return MomentResponse.builder()
                .id(moment.getId())
                .milestone(moment.isMilestone())
                .build();
    }

    @Transactional
    public MomentResponse updateMomentVisibility(UUID userId, UUID momentId, UpdateVisibilityRequest request) {
        Moment moment = momentRepository.findByIdAndDeletedAtIsNull(momentId)
                .orElseThrow(() -> new ResourcesNotFoundEx("Moment not found with Id: " + momentId));

        if (!moment.getUser().getId().equals(userId)) {
            throw new ResourcesAccessDeniedEx("You cannot update someone else's moment");
        }

        if (moment.getStory() != null) {
            throw new InvalidResourceStateEx("Cannot change visibility of a moment that belongs to a story");
        }

        if (moment.getVisibility() == request.getVisibility()) {
            throw new InvalidArgumentEx("The moment is already set to visibility: " + request.getVisibility());
        }

        moment.setVisibility(request.getVisibility());

        return MomentResponse.builder()
                .id(moment.getId())
                .visibility(moment.getVisibility())
                .build();
    }

    @Transactional(readOnly = true)
    public MomentPageResponse getUserMoments(
            UUID requesterId,
            UUID userId,
            Instant cursorCreatedAt,
            UUID cursorId,
            String order,
            int size
    ) {
        List<UUID> momentIds;
        boolean asc = "ASC".equalsIgnoreCase(order);
        if (requesterId.equals(userId)) {
            momentIds = momentRepository.findMomentIdsKeyset(userId, cursorCreatedAt, cursorId, asc, size + 1);
        } else {
            UUID connectionId = ConnectionUtils.generateConnectionId(requesterId, userId);
            Connection connection = connectionRepository.findById(connectionId)
                    .orElseThrow(() -> new ResourcesAccessDeniedEx("Connection not found or you do not have access"));
            if (connection.getConnectionType() == ConnectionType.NO_RELATION || connection.getStatus() != ConnectionStatus.CONNECTED) {
                throw new ResourcesAccessDeniedEx("Connection not found or you do not have access");
            }
            List<Visibility> allowedVisibilities = connection.getConnectionType().getAllowedVisibilities();
            List<String> allowedVisibilityStrings = allowedVisibilities.stream().map(Enum::name).toList();
            momentIds = momentRepository.findVisibleIdsKeyset(userId, allowedVisibilityStrings, cursorCreatedAt, cursorId, asc, size + 1);
        }

        List<Moment> unOrderedMoments = momentIds.isEmpty()
                ? List.of()
                : momentRepository.findAllByIdInWithUserAndStory(momentIds);


        Map<UUID, Moment> momentMap = unOrderedMoments.stream()
                .collect(Collectors.toMap(Moment::getId, m -> m));

        List<Moment> moments = momentIds.stream()
                .map(momentMap::get)
                .filter(Objects::nonNull)
                .toList();

        boolean hasNext = moments.size() > size;
        if (hasNext) moments = moments.subList(0, size);
        Instant nextCursorCreatedAt = hasNext ? moments.getLast().getCreatedAt() : null;
        UUID nextCursorId = hasNext ? moments.getLast().getId() : null;

        Set<UUID> allUserIds = new HashSet<>();
        Map<UUID, List<UUID>> momentIdToUserIds = new HashMap<>();

        List<UUID> momentIdsForReaction = moments.stream()
                .map(Moment::getId)
                .toList();

        List<MomentReactionSummary> reactions = momentReactionService.getReactionsForMoments(momentIdsForReaction);

        Map<UUID, MomentReactionSummary> reactionMap = reactions.stream()
                .collect(Collectors.toMap(MomentReactionSummary::getMomentId, r -> r));

        Map<UUID, ReactionType> myReactionMap = new HashMap<>();
        for (MomentReactionSummary r : reactions) {
            ReactionType myReaction = r.getUserReactions() != null ? r.getUserReactions().get(requesterId) : null;
            if (myReaction != null) {
                myReactionMap.put(r.getMomentId(), myReaction);
            }

            if (r.getUserReactions() == null) continue;

            List<UUID> userReactionIds = r.getUserReactions().keySet().stream()
                    .limit(3)
                    .toList();
            momentIdToUserIds.put(r.getMomentId(), userReactionIds);
            allUserIds.addAll(userReactionIds);
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

        List<MomentResponse> responses = moments.stream().map(
                m -> {
                    MomentResponse response = toResponse(
                            m
                    );
                    UUID momentId = response.getId();

                    if (response.getUser().getId().equals(requesterId)) {
                        MomentReactionSummary doc = reactionMap.get(momentId);
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

                    return response;

                }
        ).toList();

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
            UUID cursorId,
            int size,
            UUID targetUserId
    ) {
//        Set<UUID> allFriends = connectionCacheService
//                .getConnectedUserIdsByType(requesterId, ConnectionType.FRIEND);
//        Set<UUID> closeFriends = connectionCacheService
//                .getConnectedUserIdsByType(requesterId, ConnectionType.CLOSE_FRIEND);
//        Set<UUID> partners = connectionCacheService
//                .getConnectedUserIdsByType(requesterId, ConnectionType.SPECIAL);
//
//        // Visibility hierarchy:
//
//        Set<UUID> visibleAllFriends = new HashSet<>();
//        visibleAllFriends.addAll(allFriends);
//        visibleAllFriends.addAll(closeFriends);
//        visibleAllFriends.addAll(partners);
//
//        Set<UUID> visibleCloseFriends = new HashSet<>();
//        visibleCloseFriends.addAll(closeFriends);
//        visibleCloseFriends.addAll(partners);
//
//        Set<UUID> visiblePartners = partners;

//        List<UUID> momentIds = targetUserId == null
//                ? momentRepository.findFeedsKeyset(
//                requesterId,
//                cursorCreatedAt,
//                cursorId,
//                size + 1
//                visibleAllFriends.toArray(UUID[]::new),
//                visibleCloseFriends.toArray(UUID[]::new),
//                visiblePartners.toArray(UUID[]::new)
//                )
//                : momentRepository.findFeedsByTargetUser(targetUserId, cursorCreatedAt, cursorId, size + 1);

        List<UUID> momentIds;
        if (targetUserId == null) {
            momentIds = momentRepository.findFeedsKeyset(
                    requesterId,
                    cursorCreatedAt,
                    cursorId,
                    size + 1
            );
        } else if (targetUserId.equals(requesterId)){
            momentIds = momentRepository.findFeedsMe(
                    targetUserId,
                    cursorCreatedAt,
                    cursorId,
                    size + 1
            );
        } else {
            UUID connectionId = ConnectionUtils.generateConnectionId(requesterId, targetUserId);
            Connection connection = connectionRepository.findById(connectionId)
                    .orElseThrow(() -> new ResourcesAccessDeniedEx("Connection not found or you do not have access"));
            if (connection.getConnectionType() == ConnectionType.NO_RELATION || connection.getStatus() != ConnectionStatus.CONNECTED) {
                throw new ResourcesAccessDeniedEx("Connection not found or you do not have access");
            }
            List<Visibility> allowedVisibilities = connection.getConnectionType().getAllowedVisibilities();
            List<String> allowedVisibilityStrings = allowedVisibilities.stream().map(Enum::name).toList();
            momentIds = momentRepository.findFeedsByTargetUser(
                    targetUserId,
                    allowedVisibilityStrings,
                    cursorCreatedAt,
                    cursorId,
                    size + 1
            );

        }

        List<Moment> unOrderedMoments = momentIds.isEmpty()
                ? List.of()
                : momentRepository.findAllByIdInWithUserAndStory(momentIds);

        Map<UUID, Moment> momentMap = unOrderedMoments.stream()
                .collect(Collectors.toMap(Moment::getId, m -> m));


        List<Moment> moments = momentIds.stream()
                .map(momentMap::get)
                .filter(Objects::nonNull)
                .toList();

        boolean hasNext = moments.size() > size;
        if (hasNext) moments = moments.subList(0, size);
        Instant nextCursorCreatedAt = hasNext ? moments.getLast().getCreatedAt() : null;
        UUID nextCursorId = hasNext ? moments.getLast().getId() : null;

        Map<UUID, UUID> momentIdToOwnerId = moments.stream()
                .collect(Collectors.toMap(Moment::getId, r -> r.getUser().getId()));

        Set<UUID> allUserIds = new HashSet<>();
        Map<UUID, List<UUID>> momentIdToUserIds = new HashMap<>();

        List<UUID> momentIdsForReaction = moments.stream()
                .map(Moment::getId)
                .toList();

        List<MomentReactionSummary> reactions = momentIdsForReaction.isEmpty()
                ? List.of()
                : momentReactionService.getReactionsForMoments(momentIdsForReaction);

        Map<UUID, MomentReactionSummary> reactionMap = reactions.stream()
                .collect(Collectors.toMap(MomentReactionSummary::getMomentId, r -> r));

        Map<UUID, ReactionType> myReactionMap = new HashMap<>();
        for (MomentReactionSummary reaction : reactions) {
            UUID momentId = reaction.getMomentId();
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

        List<MomentResponse> responses = moments.stream().map(
                m -> {
                    MomentResponse response = toResponse(
                            m
                    );
                    UUID momentId = response.getId();
                    if (response.getUser().getId().equals(requesterId)) {
                        MomentReactionSummary doc = reactionMap.get(momentId);
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
                    return response;
                }
        ).toList();

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
            UUID cursorId,
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
        // query momentIds theo storyId
        List<UUID> momentIds = momentRepository.findIdsByStoryIdKeyset(storyId, cursorCreatedAt, cursorId, asc, size + 1);

        List<Moment> unOrderedMoments = momentIds.isEmpty()
                ? List.of()
                : momentRepository.findAllByIdInWithUserAndStory(momentIds);

        Map<UUID, Moment> momentMap = unOrderedMoments.stream()
                .collect(Collectors.toMap(Moment::getId, m -> m));



        List<Moment> moments = momentIds.stream()
                .map(momentMap::get)
                .filter(Objects::nonNull)
                .toList();

        boolean hasNext = moments.size() > size;
        if (hasNext) moments = moments.subList(0, size);
        Instant nextCursorCreatedAt = hasNext ? moments.getLast().getCreatedAt() : null;
        UUID nextCursorId = hasNext ? moments.getLast().getId() : null;

        Map<UUID, UUID> momentIdToOwnerId = moments.stream()
                .collect(Collectors.toMap(Moment::getId, r -> r.getUser().getId()));

        Set<UUID> allUserIds = new HashSet<>();
        Map<UUID, List<UUID>> momentIdToUserIds = new HashMap<>();

        List<UUID> momentIdsForReaction = moments.stream()
                .map(Moment::getId)
                .toList();

        List<MomentReactionSummary> reactions = momentIdsForReaction.isEmpty()
                ? List.of()
                : momentReactionService.getReactionsForMoments(momentIdsForReaction);

        Map<UUID, MomentReactionSummary> reactionMap = reactions.stream()
                .collect(Collectors.toMap(MomentReactionSummary::getMomentId, r -> r));

        Map<UUID, ReactionType> myReactionMap = new HashMap<>();

        for (MomentReactionSummary reaction : reactions) {
            UUID momentId = reaction.getMomentId();
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

        List<MomentResponse> responses = moments.stream().map(
                m -> {
                    MomentResponse response = toResponse(
                            m
                    );
                    UUID momentId = response.getId();
                    if (response.getUser().getId().equals(requesterId)) {
                        MomentReactionSummary doc = reactionMap.get(momentId);
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
                    return response;
                }
        ).toList();

        return MomentPageResponse.builder()
                .moments(responses)
                .hasNext(hasNext)
                .nextCursorCreatedAt(nextCursorCreatedAt)
                .nextCursorId(nextCursorId)
                .build();
    }

    @Transactional
    public MomentReactionDto toggleReaction(UUID userId, UUID momentId, ReactionType reactionType) {
        Moment moment = momentRepository.findByIdAndDeletedAtIsNull(momentId)
                .orElseThrow(() -> new ResourcesNotFoundEx("Moment not found with Id: " + momentId));
        log.info("moment found");

        if (moment.getUser().getId().equals(userId)) {
            throw new InvalidResourceStateEx("You cannot react to your own moment");
        }

        UUID connectionId = ConnectionUtils.generateConnectionId(moment.getUser().getId(), userId);
        Connection connection = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new ResourcesAccessDeniedEx("Access denied: no connection found"));
        if (connection.getConnectionType() == ConnectionType.NO_RELATION || connection.getStatus() != ConnectionStatus.CONNECTED) {
            throw new ResourcesAccessDeniedEx("Access denied: no connection found");
        }

        log.info("connection found");

        ReactionType userReaction = momentReactionService.toggleReaction(userId, momentId, reactionType);


        log.info("reacted");
        return MomentReactionDto.builder()
                .momentId(momentId)
                .userReaction(userReaction)
                .build();
    }

    @Transactional(readOnly = true)
    public MomentReactionResponse getMomentReaction(UUID userId, UUID momentId) {
        Moment moment = momentRepository.findByIdAndDeletedAtIsNull(momentId)
                .orElseThrow(() -> new ResourcesNotFoundEx("Moment not found with Id: " + momentId));

        if (!moment.getUser().getId().equals(userId)) {
            throw new ResourcesAccessDeniedEx("You do not have access to this moment");
        }

        MomentReactionSummary reactions = momentReactionService.getMomentReactions(momentId);
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


    private MomentResponse toResponse(Moment moment) {


        return MomentResponse.builder()
                .id(moment.getId())
                .story(moment.getStory() != null ? toStoryPreviewDto(moment.getStory()) : null)
                .user(userMapper.toProfilePreview(moment.getUser()))
                .mediaUrl(moment.getMediaUrl())
                .audioUrl(moment.getAudioUrl())
                .visibility(moment.getVisibility())
                .caption(moment.getCaption())
                .position(moment.getPosition())
                .dayIndex(moment.getDayIndex())
                .createdAt(moment.getCreatedAt())
                .lastModifiedAt(moment.getLastModifiedAt())
                .milestone(moment.isMilestone())
                .build();
    }

    private StoryPreviewDto toStoryPreviewDto(Story story) {
        return StoryPreviewDto.builder()
                .id(story.getId())
                .type(story.getType())
                .title(story.getTitle())
                .scope(story.getScope())
                .duration(story.getDuration())
                .build();
    }
}