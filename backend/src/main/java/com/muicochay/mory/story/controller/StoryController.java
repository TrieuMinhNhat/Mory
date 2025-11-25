package com.muicochay.mory.story.controller;

import com.muicochay.mory.auth.model.AuthUserPrincipal;
import com.muicochay.mory.shared.dto.ApiResponse;
import com.muicochay.mory.shared.ratelimit.RateLimit;
import com.muicochay.mory.shared.ratelimit.RateLimitKeyStrategy;
import com.muicochay.mory.story.dto.*;
import com.muicochay.mory.story.enums.StoryType;
import com.muicochay.mory.story.service.StoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/stories")
@RequiredArgsConstructor
public class StoryController {
    private final StoryService storyService;

    @PostMapping
    @RateLimit(
            prefix = "story::create:",
            limit = 10,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<StoryResponse>> createStory(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @RequestBody StoryRequest request
    ) {
        StoryResponse response = storyService.createStory(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, ""));
    }

    @GetMapping("/{storyId}")
    @RateLimit(
            prefix = "story::get-by-id:",
            limit = 60,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<StoryResponse>> getStory(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @PathVariable UUID storyId
    ) {
        StoryResponse response = storyService.getStory(principal.getId(), storyId);
        return ResponseEntity.ok(ApiResponse.success(response, "Fetch story successfully"));
    }

    @GetMapping("/user/{userId}")
    @RateLimit(
            prefix = "story::get-by-user:",
            limit = 60,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<StoryPageResponse>> getStoriesByUser(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @PathVariable UUID userId,
            @RequestParam(name = "type", required = false) StoryType type,
            @RequestParam(name = "cursorCreatedAt", required = false) Instant cursorCreatedAt,
            @RequestParam(name = "cursorId", required = false) UUID cursorId,
            @RequestParam(name = "order", defaultValue = "DESC") String order,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader(value = "X-User-Timezone", required = false) String timezoneHeader
    ) {
        String timezone = (timezoneHeader != null && !timezoneHeader.isBlank())
                ? timezoneHeader
                : "Asia/Ho_Chi_Minh";
        StoryPageResponse response = storyService.getStoriesByUser(principal.getId(), userId, type, cursorCreatedAt, cursorId, order, size, timezone);

        return ResponseEntity.ok(
                ApiResponse.success(response, "Fetched stories successfully")
        );
    }

    @GetMapping("/available-for-add-moment")
    @RateLimit(
            prefix = "story::available-for-add-moment:",
            limit = 60,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<StoryPageResponse>> getAvailableStoriesForAddMoment(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @RequestParam(required = false) StoryType type,
            @RequestParam(name = "cursorCreatedAt", required = false) Instant cursorCreatedAt,
            @RequestParam(name = "cursorId", required = false) UUID cursorId,
            @RequestParam(name = "order", defaultValue = "DESC") String order,
            @RequestParam(defaultValue = "20") int size
    ) {
        StoryPageResponse response = storyService.getAvailableStoriesForAddMoment(
                principal.getId(),
                cursorCreatedAt,
                cursorId,
                order,
                size,
                type
        );

        return ResponseEntity.ok(
                ApiResponse.success(response, "Fetched available stories successfully")
        );
    }



    @PatchMapping("/{storyId}")
    @RateLimit(
            prefix = "story::update:",
            limit = 20,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<StoryResponse>> updateStory(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @PathVariable UUID storyId,
            @RequestBody UpdateStoryRequest request
    ) {
        StoryResponse response = storyService.updateStory(principal.getId(), storyId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Story updated successfully"));
    }

    @PostMapping("/{storyId}/add-members")
    @RateLimit(
            prefix = "story::add-members:",
            limit = 20,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<StoryResponse>> addMembers(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @PathVariable UUID storyId,
            @RequestBody AddMembersRequest request
    ) {
        StoryResponse response = storyService.addMember(principal.getId(), storyId, request.getNewMemberIds());
        return ResponseEntity.ok(ApiResponse.success(response, "Members added successfully"));
    }

    @PostMapping("/{storyId}/kick-members")
    @RateLimit(
            prefix = "story::kick-members:",
            limit = 20,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<StoryResponse>> kickMembers(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @PathVariable UUID storyId,
            @RequestBody KickMembersRequest request
            ) {
        StoryResponse response = storyService.kickMember(principal.getId(), storyId, request.getMemberIds());
        return ResponseEntity.ok(ApiResponse.success(response, "Members removed successfully"));
    }

    @PostMapping("/{storyId}/leave")
    @RateLimit(
            prefix = "story::leave:",
            limit = 20,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<LeaveStoryResponse>> leaveStory(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @PathVariable UUID storyId,
            @RequestBody LeaveStoryRequest request
    ) {
        LeaveStoryResponse response = storyService.leaveStory(principal.getId(), storyId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "You left the story"));
    }

    @DeleteMapping("/{storyId}")
    @RateLimit(
            prefix = "story::delete:",
            limit = 20,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<DeletedStoryResponse>> deleteStory(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @PathVariable UUID storyId
    ) {
        DeletedStoryResponse response = storyService.deleteStory(principal.getId(), storyId);
        return ResponseEntity.ok(ApiResponse.success(response, "Story deleted"));
    }

    @PostMapping("/{storyId}/dissolve")
    @RateLimit(
            prefix = "story::dissolve:",
            limit = 20,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<DissolvedStoryResponse>> dissolveStory(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @PathVariable UUID storyId
    ) {
        DissolvedStoryResponse response = storyService.dissolveStory(principal.getId(), storyId);
        return ResponseEntity.ok(ApiResponse.success(response, "Story dissolved"));
    }
}
