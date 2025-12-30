package com.muicochay.mory.story.service;

import com.muicochay.mory.connection.enums.ConnectionStatus;
import com.muicochay.mory.connection.enums.ConnectionType;
import com.muicochay.mory.connection.repository.ConnectionRepository;
import com.muicochay.mory.connection.utils.ConnectionUtils;
import com.muicochay.mory.conversation.service.ConversationService;
import com.muicochay.mory.moment.entity.Moment;
import com.muicochay.mory.moment.repository.MomentRepository;
import com.muicochay.mory.shared.enums.Visibility;
import com.muicochay.mory.shared.exception.global.InvalidArgumentEx;
import com.muicochay.mory.shared.exception.global.InvalidResourceStateEx;
import com.muicochay.mory.shared.exception.global.ResourcesAccessDeniedEx;
import com.muicochay.mory.shared.exception.global.ResourcesNotFoundEx;
import com.muicochay.mory.story.config.StoryProperties;
import com.muicochay.mory.story.dto.*;
import com.muicochay.mory.story.entity.Story;
import com.muicochay.mory.story.entity.StoryMember;
import com.muicochay.mory.story.enums.LeaveStoryAction;
import com.muicochay.mory.story.enums.StoryMomentHandling;
import com.muicochay.mory.story.enums.StoryScope;
import com.muicochay.mory.story.enums.StoryType;
import com.muicochay.mory.story.interfaces.StoryMomentCountProjection;
import com.muicochay.mory.story.repository.StoryMemberRepository;
import com.muicochay.mory.story.repository.StoryRepository;
import com.muicochay.mory.user.dto.UserPreviewResponse;
import com.muicochay.mory.user.entity.User;
import com.muicochay.mory.user.entity.UserProfile;
import com.muicochay.mory.user.mapper.UserMapper;
import com.muicochay.mory.user.repositoriy.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor

public class StoryService {
    private final StoryRepository storyRepository;
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    private final MomentRepository momentRepository;
    private final ConnectionRepository connectionRepository;
    private final StoryMemberRepository storyMemberRepository;
    private final ConversationService conversationService;

    private final StoryProperties storyProperties;

    @Transactional
    public StoryResponse createStory(UUID creatorId, StoryRequest request) {
        if (request.getType() == null) {
            throw new InvalidArgumentEx("Story type is missing.");
        }
        if (request.getTitle() == null || request.getTitle().trim().isBlank()) {
            throw new InvalidArgumentEx("Story title is missing");
        }
        if (request.getTitle().trim().length() > 25) {
            throw new InvalidArgumentEx("Story title cannot exceed 25 characters");
        }

        Story story = switch (request.getType()) {
            case BEFORE_AFTER -> buildBeforeAfterStory(creatorId, request);
            case JOURNEY      -> buildJourneyStory(creatorId, request);
            case CHALLENGE    -> buildChallengeStory(creatorId, request);
            case ALBUM        -> buildAlbumStory(creatorId, request);
        };

        Story savedStory = storyRepository.save(story);
        return buildStoryResponse(savedStory, true);
    }

    private Story buildAlbumStory(UUID creatorId, StoryRequest request) {
        User creator = userRepository.getReferenceById(creatorId);

        Story story = Story.builder()
                .creator(creator)
                .type(request.getType())
                .title(request.getTitle())
                .scope(request.getScope() != null ? request.getScope() : StoryScope.PERSONAL)
                .duration(request.getDuration())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .members(new ArrayList<>())
                .build();

        if (request.getScope() == StoryScope.PERSONAL) {
            story.setVisibility(
                    request.getVisibility() == null
                            ? Visibility.ALL_FRIENDS
                            : request.getVisibility());
        } else {
            story.setVisibility(Visibility.ALL_FRIENDS);
        }

        Story savedStory = storyRepository.save(story);

        if (canAddMembers(request.getScope(), request.getType())) {
            List<UUID> distinctMemberIds = request.getMemberIds().stream()
                    .distinct()
                    .filter(r -> !r.equals(creatorId))
                    .toList();

            Set<UUID> connectedUserIds = connectionRepository.findConnectedUserIds(
                    creatorId,
                    distinctMemberIds,
                    List.of(ConnectionStatus.CONNECTED)
            );

            if (!connectedUserIds.isEmpty()) {
                if (connectedUserIds.size() > storyProperties.getMaxMembers() - 1) {
                    throw new InvalidArgumentEx("Number of members exceeds the maximum allowed: " + storyProperties.getMaxMembers());
                }

                List<User> members = userRepository.findAllById(connectedUserIds);

                List<StoryMember> storyMembers = members.stream()
                        .map(user -> StoryMember.builder()
                                .story(savedStory)
                                .user(user)
                                .build())
                        .toList();

                storyMembers.forEach(m -> m.setStory(savedStory));
                savedStory.getMembers().addAll(storyMembers);
            }
        }

        if (savedStory.getScope() == StoryScope.GROUP) {
            conversationService.createStoryConversation(savedStory);
        }

        return savedStory;
    }

    private Story buildChallengeStory(UUID creatorId, StoryRequest request) {
        if (request.getScope() != null && request.getScope() != StoryScope.PERSONAL) {
            throw new InvalidArgumentEx("CHALLENGE stories can only have PERSONAL scope.");
        }
        if (request.getDuration() == null || request.getDuration() <= 2) {
            throw new InvalidArgumentEx("Duration must be greater than 2 for CHALLENGE stories.");
        }

        User creator = userRepository.findWithProfileById(creatorId)
                .orElseThrow(() -> new ResourcesNotFoundEx("User not found with id: " + creatorId));
        LocalDate today = LocalDate.now(ZoneId.of(creator.getProfile().getTimezone()));



        LocalDate start = request.getStartDate();
        LocalDate end   = request.getEndDate();
        Integer duration = request.getDuration();

        if (start == null || end == null) {
            throw new InvalidArgumentEx("CHALLENGE stories must have startDate and endDate.");
        }
        if (start.isBefore(today)) {
            throw new InvalidArgumentEx("Start date cannot be before today");
        }
        if (!end.isAfter(start)) {
            throw new InvalidArgumentEx("End date must be after start date");
        }
        long days = ChronoUnit.DAYS.between(start, end) + 1;
        if (days < duration) {
            throw new InvalidArgumentEx("The number of days between startDate and endDate must be at least the challenge duration.");
        }

        Story story = Story.builder()
                .creator(creator)
                .type(request.getType())
                .title(request.getTitle())
                .scope(StoryScope.PERSONAL)
                .duration(request.getDuration())
                .startDate(request.getStartDate())
                .visibility(
                        request.getVisibility() == null
                                ? Visibility.ALL_FRIENDS
                                : request.getVisibility()
                )
                .endDate(request.getEndDate())
                .build();

        return storyRepository.save(story);
    }

    private Story buildBeforeAfterStory(UUID creatorId, StoryRequest request) {
        User creator = userRepository.getReferenceById(creatorId);

        Story story = Story.builder()
                .creator(creator)
                .type(request.getType())
                .title(request.getTitle())
                .scope(StoryScope.PERSONAL)
                .visibility(
                        request.getVisibility() == null
                                ? Visibility.ALL_FRIENDS
                                : request.getVisibility())
                .build();

        return storyRepository.save(story);
    }

    private Story buildJourneyStory(UUID creatorId, StoryRequest request) {
        if (request.getType() == StoryType.JOURNEY
                && request.getStartDate() == null && request.getEndDate() == null) {
            throw new InvalidArgumentEx("JOURNEY stories must have startDate and endDate.");
        }

        User creator = userRepository.findWithProfileById(creatorId)
                .orElseThrow(() -> new ResourcesNotFoundEx("User not found with id: " + creatorId));
        LocalDate today = LocalDate.now(ZoneId.of(creator.getProfile().getTimezone()));

        LocalDate start = request.getStartDate();
        LocalDate end   = request.getEndDate();

        if (start == null) {
            throw new InvalidArgumentEx("CHALLENGE stories must have startDate");
        }

        if (end != null && start.isAfter(end)) {
            throw new InvalidArgumentEx("Start date cannot be after end date");
        }

        if (start.isBefore(today)) {
            throw new InvalidArgumentEx("Start date cannot be before today");
        }

        Story story = Story.builder()
                .creator(creator)
                .type(request.getType())
                .title(request.getTitle())
                .scope(request.getScope() != null ? request.getScope() : StoryScope.PERSONAL)
                .duration(request.getDuration())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .members(new ArrayList<>())
                .build();

        if (request.getScope() == StoryScope.PERSONAL) {
            story.setVisibility(
                    request.getVisibility() == null
                            ? Visibility.ALL_FRIENDS
                            : request.getVisibility());
        } else {
            story.setVisibility(Visibility.ALL_FRIENDS);
        }

        Story savedStory = storyRepository.save(story);

        if (canAddMembers(request.getScope(), request.getType())) {
            List<UUID> distinctMemberIds = request.getMemberIds().stream()
                    .distinct()
                    .filter(r -> !r.equals(creatorId))
                    .toList();

            Set<UUID> connectedUserIds = connectionRepository.findConnectedUserIds(
                    creatorId,
                    distinctMemberIds,
                    List.of(ConnectionStatus.CONNECTED)
            );

            if (!connectedUserIds.isEmpty()) {
                if (connectedUserIds.size() > storyProperties.getMaxMembers() - 1) {
                    throw new InvalidArgumentEx("Number of members exceeds the maximum allowed: " + storyProperties.getMaxMembers());
                }

                List<User> members = userRepository.findAllById(connectedUserIds);

                List<StoryMember> storyMembers = members.stream()
                        .map(user -> StoryMember.builder()
                                .story(savedStory)
                                .user(user)
                                .build())
                        .toList();

                storyMembers.forEach(m -> m.setStory(savedStory));
                savedStory.getMembers().addAll(storyMembers);
            }
        }

        if (savedStory.getScope() == StoryScope.GROUP) {
            conversationService.createStoryConversation(savedStory);
        }
        return savedStory;
    }


    @Transactional
    public StoryResponse addMember(UUID requesterId, UUID storyId, List<UUID> memberIds) {
        if (memberIds == null || memberIds.isEmpty()) {
            throw new InvalidArgumentEx("memberIds cannot be empty");
        }

        Story story = storyRepository.findByIdWithMembers(storyId)
                .orElseThrow(() -> new ResourcesNotFoundEx("Story not found with Id: " + storyId));

        LocalDate today = LocalDate.now(ZoneId.of(story.getCreator().getProfile().getTimezone()));

        if (story.getType() == StoryType.JOURNEY && story.getEndDate() != null && !story.getEndDate().isAfter(today)) {
            throw new InvalidResourceStateEx("Cannot add members to a journey that has already ended");
        }

        if (!canAddMembers(story.getScope(), story.getType())) {
            throw new InvalidResourceStateEx("Cannot add member to personal story");
        }
        boolean isMember = story.getCreator().getId().equals(requesterId) ||
                story.getMembers().stream().anyMatch(m -> m.getUser().getId().equals(requesterId));
        if (!isMember) {
            throw new ResourcesAccessDeniedEx("Only member can add new member");
        }

        Set<UUID> existingMemberIds = story.getMembers().stream()
                .map(m -> m.getUser().getId())
                .collect(Collectors.toSet());
        existingMemberIds.add(story.getCreator().getId());

        List<UUID> candidateIds = memberIds.stream()
                .distinct()
                .filter(id -> !existingMemberIds.contains(id))
                .filter(id -> !id.equals(story.getCreator().getId()))
                .toList();

        if (candidateIds.isEmpty()) {
            return buildStoryResponse(story, true);
        }

        int totalAfterAdd = existingMemberIds.size() + candidateIds.size() + 1;
        if (totalAfterAdd > storyProperties.getMaxMembers()) {
            throw new InvalidArgumentEx("Number of members exceeds the maximum allowed: " + storyProperties.getMaxMembers());
        }

        Set<UUID> connectedUserIds = connectionRepository.findConnectedUserIds(
                requesterId,
                candidateIds,
                List.of(ConnectionStatus.CONNECTED)
        );

        List<UUID> newMemberIds = userRepository.findExistingUserIdsByIds(connectedUserIds);

        List<StoryMemberCreateRequest> newStoryMembers = newMemberIds.stream()
                .map(id -> StoryMemberCreateRequest.builder()
                        .storyId(story.getId())
                        .userId(id)
                        .build())
                .toList();

        storyMemberRepository.saveAllIgnoreDuplicates(newStoryMembers);

        conversationService.addMembersToStoryConversation(
                story.getId(),
                newMemberIds
        );


        List<StoryMember> latestMembers = storyMemberRepository.findByStoryId(storyId);

        List<UserPreviewResponse> memberInfos = new ArrayList<>();
        memberInfos.add(userMapper.toProfilePreview(story.getCreator()));
        memberInfos.addAll(
                latestMembers.stream()
                        .map(m -> userMapper.toProfilePreview(m.getUser()))
                        .toList()
        );
        return StoryResponse.builder()
                .id(story.getId())
                .members(memberInfos)
                .build();
    }

    @Transactional
    public StoryResponse kickMember(UUID requesterId, UUID storyId, List<UUID> memberIds) {
        Story story = storyRepository.findByIdWithMembers(storyId)
                .orElseThrow(() -> new ResourcesNotFoundEx("Story not found with Id: " + storyId));

        if ((story.getType() != StoryType.JOURNEY && story.getType() != StoryType.ALBUM) || story.getScope() != StoryScope.GROUP) {
            throw new InvalidResourceStateEx("Cannot remove members from personal story");
        }
        if (!story.getCreator().getId().equals(requesterId)) {
            throw new ResourcesAccessDeniedEx("Only creator can remove members");
        }

        LocalDate today = LocalDate.now(ZoneId.of(story.getCreator().getProfile().getTimezone()));
        if (story.getEndDate() != null && !story.getEndDate().isAfter(today)) {
            throw new InvalidResourceStateEx("Cannot kick members from a journey that has already ended");
        }

        List<UUID> filteredMemberIds = memberIds.stream()
                .filter(id -> !id.equals(requesterId))
                .toList();

        int deletedCount = storyMemberRepository.deleteByStoryIdAndUserIdIn(
                storyId,
                filteredMemberIds
        );

        conversationService.kickMembersFromStoryConversation(
                story.getId(),
                filteredMemberIds
        );

        int total = momentRepository.unlinkByStoryIdAndUserIds(storyId, filteredMemberIds);

        List<StoryMember> latestMembers = storyMemberRepository.findByStoryId(storyId);

        List<UserPreviewResponse> memberInfos = new ArrayList<>();
        memberInfos.add(userMapper.toProfilePreview(story.getCreator()));
        memberInfos.addAll(
                latestMembers.stream()
                        .map(m -> userMapper.toProfilePreview(m.getUser()))
                        .toList()
        );
        return StoryResponse.builder()
                .id(story.getId())
                .members(memberInfos)
                .build();
    }

    @Transactional
    public LeaveStoryResponse leaveStory(UUID userId, UUID storyId, LeaveStoryRequest request) {
        Story story = storyRepository.findByIdWithCreator(storyId)
                .orElseThrow(() -> new ResourcesNotFoundEx("Story not found with Id: " + storyId));

        if (story.getCreator().getId().equals(userId)) {
            throw new InvalidResourceStateEx("Creator cannot leave the story");
        }

        int removedCount = storyMemberRepository.deleteByStoryIdAndUserId(storyId, userId);
        if (removedCount == 0) {
            throw new ResourcesNotFoundEx("Only members can leave the story");
        }

        if (request.getAction() == LeaveStoryAction.KEEP_AS_INDEPENDENT_MOMENTS) {
            int affectedMoments = momentRepository.unlinkByStoryIdAndUserId(storyId, userId);
            return LeaveStoryResponse.builder()
                    .affectedMomentCount(affectedMoments)
                    .build();
        } else if (request.getAction() == LeaveStoryAction.CREATE_PERSONAL_STORY) {
            Story newStory = createNewPersonalStoryFromExisting(story, userId);
            StoryResponse storyResponse = buildStoryResponse(newStory, false);
            return LeaveStoryResponse.builder()
                    .storyResponse(storyResponse)
                    .build();
        }
        int affectedMoments = momentRepository.softDeleteByStoryIdAndUserId(storyId, userId, Instant.now());

        conversationService.leaveGroupConversation(story.getId(), userId);

        return LeaveStoryResponse.builder()
                .affectedMomentCount(affectedMoments)
                .build();
    }

    private Story createNewPersonalStoryFromExisting(Story originalStory, UUID userId) {
        Moment latestUserMoment = momentRepository.findFirstByUserIdAndStoryIdAndDeletedAtIsNullOrderByCreatedAtDescIdDesc(
                userId,
                originalStory.getId()
        ).orElse(null);
        Story newStory = Story.builder()
                .creator(User.builder().id(userId).build())
                .title(originalStory.getTitle())
                .type(originalStory.getType())
                .visibility(Visibility.ALL_FRIENDS)
                .scope(StoryScope.PERSONAL)
                .startDate(originalStory.getStartDate())
                .endDate(originalStory.getEndDate())
                .latestMomentCreatedAt(latestUserMoment != null ? latestUserMoment.getCreatedAt() : null)
                .latestMomentId(latestUserMoment != null ? latestUserMoment.getId() : null)
                .build();
        storyRepository.saveAndFlush(newStory);

        Moment latestStoryMoment = momentRepository.findFirstByStoryIdAndUserIdNotAndDeletedAtIsNullOrderByCreatedAtDescIdDesc(
                originalStory.getId(),
                userId
        ).orElse(null);

        originalStory.setLatestMomentCreatedAt(latestStoryMoment != null ? latestStoryMoment.getCreatedAt() : null);
        originalStory.setLatestMomentId(latestStoryMoment != null ? latestStoryMoment.getId() : null);
        storyRepository.save(originalStory);

        momentRepository.moveMomentsToAnotherStory(originalStory.getId(), newStory.getId(), userId);

        return newStory;
    }

    @Transactional
    public StoryResponse updateStory(UUID creatorId, UUID storyId, UpdateStoryRequest request) {
        Story story = storyRepository.findByIdWithCreatorAndProfile(storyId)
                .orElseThrow(() -> new ResourcesNotFoundEx("Story not found with Id: " + storyId));

        if (story.getType() == StoryType.CHALLENGE) {
            if (request.getStartDate() != null || request.getEndDate() != null) {
                throw new InvalidResourceStateEx("Challenge stories cannot update start or end date");
            }
        }
        if (request.getVisibility() != null && story.getScope() == StoryScope.GROUP) {
            throw new InvalidArgumentEx("Cannot change visibility of a group story");
        }
        if (!story.getCreator().getId().equals(creatorId)) {
            throw new ResourcesAccessDeniedEx("Only creator can update story");
        }

        if (StringUtils.hasText(request.getTitle()) && !request.getTitle().equals(story.getTitle())) {
            story.setTitle(request.getTitle().trim());
            conversationService.updateTitleForStoryConversation(
                    story.getId(),
                    request.getTitle().trim()
            );
        }

        if (story.getType() == StoryType.JOURNEY) {
            LocalDate today = LocalDate.now(ZoneId.of(story.getCreator().getProfile().getTimezone()));
            boolean hasMoment = momentRepository.existsByStoryIdAndDeletedAtIsNull(storyId);

            LocalDate newStart = request.getStartDate();
            LocalDate newEnd   = request.getEndDate();

            if (newStart != null && newEnd != null && newStart.isAfter(newEnd)) {
                throw new InvalidArgumentEx("Start date cannot be after end date");
            }
            if (newStart != null) {
                if (story.getStartDate() != null && !story.getStartDate().isAfter(today) && hasMoment) {
                    throw new InvalidResourceStateEx("Cannot update start date because story has already started");
                }
                story.setStartDate(newStart);
            }
            if (newEnd != null) {
                if (story.getEndDate() != null && !story.getEndDate().isAfter(today) && hasMoment) {
                    throw new InvalidResourceStateEx("Cannot update end date because story has already ended");
                }
                if (hasMoment && newEnd.isBefore(today)) {
                    throw new InvalidArgumentEx("End date cannot be before today when the story already has moments");
                }
                story.setEndDate(newEnd);
            }
        }

        if (story.getScope() == StoryScope.PERSONAL
                && request.getVisibility() != null
                && !request.getVisibility().equals(story.getVisibility())
        ) {
            story.setVisibility(request.getVisibility());
            int total = momentRepository.updateVisibilityByStoryId(story.getId(), request.getVisibility());
        }

        return StoryResponse.builder()
                .title(story.getTitle())
                .visibility(story.getVisibility())
                .startDate(story.getStartDate())
                .endDate(story.getEndDate())
                .build();
    }


    @Transactional
    public DeleteStoryResponse deleteStory(
            UUID requesterId,
            UUID storyId,
            StoryMomentHandling momentHandling
    ) {
        Story story = storyRepository.findByIdWithCreator(storyId)
                .orElseThrow(() ->
                        new ResourcesNotFoundEx("Story not found with Id: " + storyId)
                );

        UUID creatorId = story.getCreator().getId();
        if (!requesterId.equals(creatorId)) {
            throw new ResourcesAccessDeniedEx("You are not allowed to delete this story");
        }

        Instant now = Instant.now();
        story.setDeletedAt(now);

        if (story.getScope() == StoryScope.GROUP) {
            conversationService.removeConversation(story.getId());
        }

        int affectedMomentCount;

        if (momentHandling == StoryMomentHandling.DELETE) {
            affectedMomentCount = momentRepository.softDeleteByStoryId(storyId, now);
        } else {
            affectedMomentCount = momentRepository.unlinkByStoryId(storyId);
        }

        return DeleteStoryResponse.builder()
                .momentHandling(momentHandling)
                .affectedMomentCount(affectedMomentCount)
                .build();
    }

    @Transactional(readOnly = true)
    public StoryResponse getStory(UUID requesterId, UUID storyId) {
        Story story = storyRepository.findByIdWithMembers(storyId)
                .orElseThrow(() -> new ResourcesNotFoundEx("Story not found with Id: " + storyId));
        UUID creatorId = story.getCreator().getId();
        boolean isCreator = requesterId.equals(creatorId);

        StoryMember requesterMember = story.getMembers().stream()
                .filter(m -> m.getUser().getId().equals(requesterId))
                .findFirst()
                .orElse(null);

        boolean isMember = requesterMember != null;

        User requester = isCreator
                ? story.getCreator()
                : (isMember ? requesterMember.getUser() : null);

        if (!isCreator && !isMember) {
            List<UUID> relatedUserIds = Stream.concat(
                    story.getMembers().stream().map(m -> m.getUser().getId()),
                    Stream.of(story.getCreator().getId())
            ).toList();

            List<UUID> connectionIds = relatedUserIds.stream().map(userId -> ConnectionUtils.generateConnectionId(requesterId, userId)).toList();

            boolean hasConnection = connectionRepository.existsAnyConnectionByIds(connectionIds, List.of(ConnectionStatus.CONNECTED.name()));

            if (!hasConnection) {
                throw new ResourcesAccessDeniedEx("You do not have access to this story");
            }
        }

        StoryResponse response = buildStoryResponse(story, true);

        StoryMomentCountProjection result = momentRepository.countMomentsByStoryId(storyId)
                .orElse(null);

        long total = result == null ? 0 : result.getTotal();

        response.setTotalMoments(total);
        if (story.getType() == StoryType.ALBUM || story.getType() == StoryType.BEFORE_AFTER) {
            Instant first = story.getCreatedAt();
            Instant last = story.getLatestMomentCreatedAt();

            String tz = Optional.ofNullable(requester)
                    .map(User::getProfile)
                    .map(UserProfile::getTimezone)
                    .orElse("UTC");

            ZoneId zoneId;
            try {
                zoneId = ZoneId.of(tz);
            } catch (Exception e) {
                zoneId = ZoneOffset.UTC;
            }

            response.setStartDate(first != null ? LocalDate.ofInstant(first, zoneId) : null);
            response.setEndDate(last != null ? LocalDate.ofInstant(last, zoneId) : null);
        }

        return response;
    }

    @Transactional(readOnly = true)
    public StoryPageResponse getStoriesByUser(UUID requesterId, UUID userId, StoryType type, Instant cursorCreatedAt, UUID cursorId, String order, int size) {
        boolean asc = "ASC".equalsIgnoreCase(order);
        List<UUID> storyIds;

        String typeName = (type != null) ? type.name() : null;
        if (requesterId.equals(userId)) {
            storyIds = storyRepository.findIdsByUserIdAndTypeKeyset(
                    userId,
                    typeName,
                    cursorCreatedAt,
                    cursorId,
                    asc,
                    size + 1
            );
        } else {
            UUID connectionId = ConnectionUtils.generateConnectionId(requesterId, userId);
            ConnectionType connectionType = connectionRepository.findTypeById(connectionId)
                    .orElseThrow(() -> new ResourcesAccessDeniedEx("Connection not found or you do not have access"));

            List<Visibility> allowedVisibilities = connectionType.getAllowedVisibilities();
            List<String> allowedVisibilityStrings = allowedVisibilities.stream().map(Enum::name).toList();
            storyIds = storyRepository.findVisibleIdsByTypeKeyset(
                    userId,
                    typeName,
                    allowedVisibilityStrings,
                    cursorCreatedAt,
                    cursorId,
                    asc,
                    size + 1
            );
        }

        List<Story> unOrderedStories = storyIds.isEmpty()
                ? List.of()
                : storyRepository.findAllByIdInWithGraph(storyIds);

        Map<UUID, Story> storyMap = unOrderedStories.stream()
                .collect(Collectors.toMap(Story::getId, s -> s));


        List<Story> stories = storyIds.stream()
                .map(storyMap::get)
                .filter(Objects::nonNull)
                .toList();

        boolean hasNext = stories.size() > size;
        if (hasNext) {
            stories = stories.subList(0, size);
            storyIds = storyIds.subList(0, size);
        }
        Instant nextCursorCreatedAt = hasNext ? stories.getLast().getCreatedAt() : null;
        UUID nextCursorId = hasNext ? stories.getLast().getId() : null;

        User requester = userRepository.findWithProfileById(requesterId)
                .orElseThrow(() -> new ResourcesNotFoundEx("User not found with Id: " + requesterId));
        String timezone = requester.getProfile().getTimezone();

        List<StoryMomentCountProjection> results = momentRepository.countMomentsByStoryIds(storyIds);

        Map<UUID, Long> momentCountMap = results.stream()
                .collect(Collectors.toMap(
                        StoryMomentCountProjection::getStoryId,
                        StoryMomentCountProjection::getTotal));

        List<StoryResponse> storyWithPreviewMomentResponse = stories.stream()
                .map(story -> {
                    StoryResponse resp = buildStoryResponse(story, true);
                    resp.setTotalMoments(momentCountMap.getOrDefault(story.getId(), 0L));
                    if (story.getType() == StoryType.ALBUM || story.getType() == StoryType.BEFORE_AFTER) {
                        Instant first = story.getCreatedAt();
                        Instant last = story.getLatestMomentCreatedAt();

                        ZoneId zoneId;
                        try {
                            zoneId = ZoneId.of(timezone);
                        } catch (Exception e) {
                            zoneId = ZoneOffset.UTC;
                        }

                        resp.setStartDate(first != null ? LocalDate.ofInstant(first, zoneId) : null);
                        resp.setEndDate(last != null ? LocalDate.ofInstant(last, zoneId) : null);
                    }

                    return resp;
                })
                .toList();

        return StoryPageResponse.builder()
                .stories(storyWithPreviewMomentResponse)
                .hasNext(hasNext)
                .nextCursorCreatedAt(nextCursorCreatedAt)
                .nextCursorId(nextCursorId)
                .build();
    }

    @Transactional(readOnly = true)
    public StoryPageResponse getAvailableStoriesForAddMoment(
            UUID userId,
            Instant cursorCreatedAt,
            UUID cursorId,
            int size,
            StoryType type
    ) {
        User user = userRepository.findWithProfileById(userId)
                .orElseThrow(() -> new ResourcesNotFoundEx("User not found with Id: " + userId));
        String timezone = user.getProfile().getTimezone();

        ZoneId zoneId = ZoneId.of(timezone);
        LocalDate today = LocalDate.now(zoneId);

        List<UUID> storyIds = storyRepository.findAvailableIdsForAddMomentKeysetOptimized(
                userId,
                today,
                cursorCreatedAt,
                cursorId,
                size + 1,
                type != null ? type.name() : null
        );

        List<Story> unOrderedStories = storyIds.isEmpty()
                ? List.of()
                : storyRepository.findAllByIdInWithGraph(storyIds);

        Map<UUID, Story> storyMap = unOrderedStories.stream()
                .collect(Collectors.toMap(Story::getId, s -> s));


        List<Story> stories = storyIds.stream()
                .map(storyMap::get)
                .filter(Objects::nonNull)
                .toList();

        List<StoryResponse> storyResponses = stories.stream().map(
                s -> buildStoryResponse(s, true)
        ).toList();

        boolean hasNext = stories.size() > size;
        if (hasNext) {
            stories = stories.subList(0, size);
        }
        Instant nextCursorCreatedAt = hasNext ? stories.getLast().getCreatedAt() : null;
        UUID nextCursorId = hasNext ? stories.getLast().getId() : null;
        return StoryPageResponse.builder()
                .stories(storyResponses)
                .hasNext(hasNext)
                .nextCursorCreatedAt(nextCursorCreatedAt)
                .nextCursorId(nextCursorId)
                .build();
    }

    private StoryResponse buildStoryResponse(Story story, boolean loadMembers) {
        List<UserPreviewResponse> memberInfos = new ArrayList<>();
        if (canAddMembers(story.getScope(), story.getType()) && loadMembers) {
            memberInfos.add(userMapper.toProfilePreview(story.getCreator()));
            memberInfos.addAll(
                    story.getMembers().stream()
                            .map(m -> userMapper.toProfilePreview(m.getUser()))
                            .toList()
            );
        }
        return StoryResponse.builder()
                .id(story.getId())
                .creator(userMapper.toProfilePreview(story.getCreator()))
                .type(story.getType())
                .title(story.getTitle())
                .scope(story.getScope())
                .visibility(story.getVisibility())
                .startDate(story.getStartDate())
                .hasAfter(story.isHasAfter())
                .hasBefore(story.isHasBefore())
                .endDate(story.getEndDate())
                .duration(story.getDuration())
                .members(loadMembers ? memberInfos : null)
                .build();
    }

    private boolean canAddMembers(StoryScope scope, StoryType type) {
        return scope == StoryScope.GROUP && type != StoryType.BEFORE_AFTER && type != StoryType.CHALLENGE;
    }
}