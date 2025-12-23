package com.muicochay.mory.moment.controller;

import com.muicochay.mory.auth.model.AuthUserPrincipal;
import com.muicochay.mory.moment.dto.*;
import com.muicochay.mory.moment.service.MomentService;
import com.muicochay.mory.shared.dto.ApiResponse;
import com.muicochay.mory.shared.dto.UpdateVisibilityRequest;
import com.muicochay.mory.shared.ratelimit.RateLimit;
import com.muicochay.mory.shared.ratelimit.RateLimitKeyStrategy;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MomentController {
    private final MomentService momentService;

    @PostMapping("/moments")
    @RateLimit(
            prefix = "moment::create-standalone:",
            limit = 10,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )

    public ResponseEntity<ApiResponse<MomentResponse>> createStandalone(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @RequestBody StandaloneMomentRequest request
    ) {
        MomentResponse response = momentService.createStandaloneMoment(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Moment created successfully"));
    }

    @PostMapping("/stories/{storyId}/moments")
    @RateLimit(
            prefix = "moment::create-in-story:",
            limit = 10,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<MomentResponse>> createInStory(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @PathVariable UUID storyId,
            @RequestBody StoryMomentRequest request
    ) {
        MomentResponse response = momentService.createMomentInStory(principal.getId(), storyId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Moment created successfully"));
    }

    @DeleteMapping("/moments/{id}")
    @RateLimit(
            prefix = "moment::delete:",
            limit = 10,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<Void>> deleteMoment(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @PathVariable(name = "id") ObjectId momentId
    ) {
        momentService.deleteMoment(principal.getId(), momentId);
        return ResponseEntity.ok(ApiResponse.success(null, "Moment deleted successfully"));
    }


    @PatchMapping("/moments/{id}/milestone")
    @RateLimit(
            prefix = "moment::update-milestone:",
            limit = 20,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<MomentResponse>> updateMomentMilestone(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @PathVariable("id") ObjectId momentId,
            @RequestBody UpdateMilestoneRequest request
    ) {
        MomentResponse updatedMoment = momentService.updateMomentMilestone(principal.getId(), momentId, request.isMilestone());
        return ResponseEntity.ok(ApiResponse.success(updatedMoment, "Moment milestone updated successfully"));
    }


    @PatchMapping("/moments/{id}/visibility")
    @RateLimit(
            prefix = "moment::update-visibility:",
            limit = 20,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<MomentResponse>> updateMomentVisibility(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @PathVariable("id") ObjectId momentId,
            @RequestBody UpdateVisibilityRequest request
            ) {
        MomentResponse updatedMoment = momentService.updateMomentVisibility(principal.getId(), momentId, request);
        return ResponseEntity.ok(ApiResponse.success(updatedMoment, "Moment visibility updated successfully"));
    }


    @PatchMapping("/moments/{id}/add-tags")
    @RateLimit(
            prefix = "moment::add-tags:",
            limit = 20,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<MomentResponse>> addMomentTags(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @PathVariable("id") ObjectId momentId,
            @RequestBody AddMomentTagsRequest request
    ) {
        MomentResponse updatedMoment = momentService.addTags(principal.getId(), momentId, request.getTaggedUserIds());
        return ResponseEntity.ok(ApiResponse.success(updatedMoment, "Moment tags added successfully"));
    }


    @PatchMapping("/moments/{id}/remove-tags")
    @RateLimit(
            prefix = "moment::remove-tags:",
            limit = 20,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<MomentResponse>> removeMomentTags(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @PathVariable("id") ObjectId momentId,
            @RequestBody RemoveMomentTagsRequest request
    ) {
        MomentResponse updatedMoment = momentService.removeTags(principal.getId(), momentId, request.getTagIds());
        return ResponseEntity.ok(ApiResponse.success(updatedMoment, "Moment tags removed successfully"));
    }


    @GetMapping("/moments/user/{userId}")
    @RateLimit(
            prefix = "moment::get-by-user:",
            limit = 60,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<MomentPageResponse>> getUserMoments(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @PathVariable UUID userId,
            @RequestParam(name = "cursorCreatedAt", required = false) Instant cursorCreatedAt,
            @RequestParam(name = "cursorId", required = false) ObjectId cursorId,
            @RequestParam(name = "order", defaultValue = "DESC") String order,
            @RequestParam(defaultValue = "20") int size
    ) {
        MomentPageResponse response = momentService.getUserMoments(principal.getId(), userId, cursorCreatedAt, cursorId, order, size);
        return ResponseEntity.ok(ApiResponse.success(response, "Fetched user moments successfully"));
    }

    @GetMapping("/stories/{storyId}/moments")
    @RateLimit(
            prefix = "moment::get-by-story:",
            limit = 60,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<MomentPageResponse>> getMomentsByStoryId(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @PathVariable UUID storyId,
            @RequestParam(name = "cursorCreatedAt", required = false) Instant cursorCreatedAt,
            @RequestParam(name = "cursorId", required = false) ObjectId cursorId,
            @RequestParam(name = "order", defaultValue = "DESC") String order,
            @RequestParam(defaultValue = "20") int size
    ) {
        MomentPageResponse response = momentService.getMomentsByStoryId(
                principal.getId(),
                storyId,
                cursorCreatedAt,
                cursorId,
                order,
                size
        );

        return ResponseEntity.ok(ApiResponse.success(response, "Fetched story moments successfully"));
    }

    @GetMapping("/moments/home-feed")
    @RateLimit(
            prefix = "moment::get-home-feeds:",
            limit = 60,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<MomentPageResponse>> getHomeFeed(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @RequestParam(name = "cursorCreatedAt", required = false) Instant cursorCreatedAt,
            @RequestParam(name = "cursorId", required = false) ObjectId cursorId,
            @RequestParam(name = "order", defaultValue = "DESC") String order,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(name = "targetUserId", required = false) UUID targetUserId
    ) {
        System.out.println("target" + targetUserId);
        MomentPageResponse response = momentService.getHomeFeedMoments(
                principal.getId(),
                cursorCreatedAt,
                cursorId,
                order,
                size,
                targetUserId
        );

        return ResponseEntity.ok(ApiResponse.success(response, "Fetched home feed moments successfully"));
    }

    @PostMapping("/moments/{id}/reaction")
    @RateLimit(
            prefix = "moment::toggle-reaction:",
            limit = 20,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<MomentReactionDto>> toggleReaction(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @PathVariable("id") ObjectId momentId,
            @RequestBody MomentReactionRequest request
    ) {
        MomentReactionDto response = momentService.toggleReaction(principal.getId(), momentId, request.getReactionType());
        return ResponseEntity.ok(ApiResponse.success(response, "Reaction toggled successfully"));
    }

    @GetMapping("/moments/{id}/reaction")
    @RateLimit(
            prefix = "moment::get-reactions",
            limit = 40,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<MomentReactionResponse>> getMomentReactions(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @PathVariable("id") ObjectId momentId
    ) {
        MomentReactionResponse response = momentService.getMomentReaction(principal.getId(), momentId);
        return ResponseEntity.ok(ApiResponse.success(response, "Get moment reactions successfully"));
    }
}
