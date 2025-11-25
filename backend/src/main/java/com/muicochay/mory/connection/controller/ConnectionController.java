package com.muicochay.mory.connection.controller;

import com.muicochay.mory.auth.model.AuthUserPrincipal;
import com.muicochay.mory.connection.dto.*;
import com.muicochay.mory.connection.enums.ConnectionStatus;
import com.muicochay.mory.connection.enums.ConnectionType;
import com.muicochay.mory.connection.enums.RequestStatus;
import com.muicochay.mory.connection.service.ConnectionService;
import com.muicochay.mory.shared.dto.ApiResponse;
import com.muicochay.mory.shared.ratelimit.RateLimit;
import com.muicochay.mory.shared.ratelimit.RateLimitKeyStrategy;
import com.muicochay.mory.user.dto.UserProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/connections")
@RequiredArgsConstructor
public class ConnectionController {
    private final ConnectionService connectionService;

    @GetMapping("/invite-link")
    @RateLimit(
            prefix = "connections::getInviteLink:",
            limit = 20,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<InviteLinkResponse>> getInviteLink(
            @AuthenticationPrincipal AuthUserPrincipal principal
    ) {
        InviteLinkResponse inviteLinkResponse = connectionService.getOrCreateInviteLink(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(inviteLinkResponse, "Invite link generated successfully"));
    }

    @GetMapping("/profile-by-invite")
    @RateLimit(
            prefix = "connections::getProfileByInvite:",
            limit = 30,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<UserProfileResponse>> getUserProfile(
            @RequestParam("userId") UUID userId,
            @RequestParam("code") String code
    ) {
        UserProfileResponse response = connectionService.getUserProfileByInviteToken(
                userId,
                code
        );
        return ResponseEntity.ok(ApiResponse.success(response, "Get user profile successfully"));
    }

    @PostMapping("/requests/send-connect")
    @RateLimit(
            prefix = "connections::sent-connect-request:",
            limit = 20,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<ConnectionRequestResponse>> sendConnectRequest(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @RequestBody SendConnectRequestDto request
    ) {
        ConnectionRequestResponse response = connectionService.sendConnectRequest(
                principal.getId(),
                request
        );
        return ResponseEntity.ok(ApiResponse.success(response, "Connection request sent successfully"));
    }

    @PostMapping("/requests/connect/{requestId}/accept")
    @RateLimit(
            prefix = "connections::accept-connect-request:",
            limit = 20,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<ConnectionResponse>> acceptConnectRequest(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @PathVariable(name = "requestId") UUID requestId
    ) {
        ConnectionResponse response = connectionService.acceptConnectRequest(
                principal.getId(),
                requestId
        );
        return ResponseEntity.ok(ApiResponse.success(response, "Connection request accepted successfully"));
    }

    @PatchMapping("change-type")
    @RateLimit(
            prefix = "connections::change-type:",
            limit = 20,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<Object>> changeConnectionType(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @RequestBody ChangeConnectionTypeRequestDto request
    ) {
        Object response = connectionService.changeConnectionType(
                principal.getId(),
                request
        );
        return ResponseEntity.ok(ApiResponse.success(response, "Connection type updated successfully"));
    }

    @PostMapping("/requests/change-type/{requestId}/accept")
    @RateLimit(
            prefix = "connections::accept-change-type-request:",
            limit = 20,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<ConnectionResponse>> acceptChangeTypeRequest(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @PathVariable(name = "requestId") UUID requestId
    ) {
        ConnectionResponse response = connectionService.acceptChangeConnectionTypeRequest(
                principal.getId(),
                requestId
        );
        return ResponseEntity.ok(ApiResponse.success(response, "Connection type change request accepted successfully"));
    }

    @PostMapping("/requests/{requestId}/cancel")
    @RateLimit(
            prefix = "connections::cancel-request:",
            limit = 20,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<ConnectionRequestResponse>> cancelRequest(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @PathVariable(name = "requestId") UUID requestId
    ) {
        ConnectionRequestResponse response = connectionService.cancelRequest(
                principal.getId(),
                requestId
        );
        return ResponseEntity.ok(ApiResponse.success(response, "Connection request canceled successfully"));
    }

    @PostMapping("/requests/{requestId}/reject")
    @RateLimit(
            prefix = "connections::reject-request:",
            limit = 20,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<ConnectionRequestResponse>> rejectRequest(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @PathVariable(name = "requestId") UUID requestId
    ) {
        ConnectionRequestResponse response = connectionService.rejectRequest(
                principal.getId(),
                requestId
        );
        return ResponseEntity.ok(ApiResponse.success(response, "Connection request rejected successfully"));
    }


    @GetMapping("/user/{userId}")
    @RateLimit(
            prefix = "connections::get-by-user:",
            limit = 60,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<ConnectionPageResponse>> getUserConnections(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @PathVariable UUID userId,
            @RequestParam(name = "cursorCreatedAt", required = false) Instant cursorCreatedAt,
            @RequestParam(name = "cursorId", required = false) UUID cursorId,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) ConnectionType type,
            @RequestParam(required = false) ConnectionStatus status,
            @RequestParam(name = "order", defaultValue = "DESC") String order
    ) {
        ConnectionPageResponse response =
                connectionService.getUserConnections(principal.getId(), userId, cursorCreatedAt, cursorId, size, type, status, order);
        return ResponseEntity.ok(ApiResponse.success(response, "Fetched user connections successfully"));
    }


    @GetMapping("/user/requests/sent")
    @RateLimit(
            prefix = "connections::get-sent-requests:",
            limit = 60,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<SentRequestsPageResponse>> getAllSentRequests(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @RequestParam(name = "cursorCreatedAt", required = false) Instant cursorCreatedAt,
            @RequestParam(name = "cursorId", required = false) UUID cursorId,
            @RequestParam(required = false) ConnectionType type,
            @RequestParam(defaultValue = "20") int size
    ) {
        SentRequestsPageResponse response = connectionService.getAllSentRequest(principal.getId(), cursorCreatedAt, cursorId, size, type, RequestStatus.PENDING);
        return ResponseEntity.ok(ApiResponse.success(response, "Fetched sent connection requests successfully"));
    }

    @GetMapping("/user/requests/received")
    @RateLimit(
            prefix = "connections::get-received-requests:",
            limit = 60,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<ReceivedRequestPageResponse>> getAllReceivedRequests(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @RequestParam(name = "cursorCreatedAt", required = false) Instant cursorCreatedAt,
            @RequestParam(name = "cursorId", required = false) UUID cursorId,
            @RequestParam(required = false) ConnectionType type,
            @RequestParam(defaultValue = "20") int size
    ) {
        ReceivedRequestPageResponse response = connectionService.getAllReceivedRequest(principal.getId(), cursorCreatedAt, cursorId, size, type, RequestStatus.PENDING);
        return ResponseEntity.ok(ApiResponse.success(response, "Fetched received connection requests successfully"));
    }

    @GetMapping("/user/suggestions")
    @RateLimit(
            prefix = "connections::get-suggestions:",
            limit = 60,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<SuggestedConnectionsPageResponse>> getSuggestedConnections(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @RequestParam(name = "cursorCreatedAt", required = false) Instant cursorCreatedAt,
            @RequestParam(name = "cursorId", required = false) UUID cursorId,
            @RequestParam(defaultValue = "10") int size
    ) {
        SuggestedConnectionsPageResponse response = connectionService.getSuggestedConnections(
                principal.getId(),
                cursorCreatedAt,
                cursorId,
                size
        );
        return ResponseEntity.ok(ApiResponse.success(response, "Fetched suggested connections successfully"));
    }

    @PostMapping("/list")
    @RateLimit(
            prefix = "connections::get",
            limit = 60,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<GetConnectionsResponse>> getConnections(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @RequestBody GetConnectionsRequest request
    ) {
        GetConnectionsResponse response = connectionService.getConnections(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response, "Fetched connections successfully"));
    }

    @PostMapping("/block/{targetUserId}")
    @RateLimit(
            prefix = "connections::block:",
            limit = 20,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<Void>> blockUser(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @PathVariable(name = "targetUserId") UUID targetUserId
    ) {
        connectionService.blockUser(principal.getId(), targetUserId);
        return ResponseEntity.ok(ApiResponse.success(null, "User blocked successfully"));
    }

    @PostMapping("/unblock/{targetUserId}")
    @RateLimit(
            prefix = "connections::unblock:",
            limit = 20,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<Void>> unblockUser(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @PathVariable(name = "targetUserId") UUID targetUserId
    ) {
        connectionService.unblockUser(principal.getId(), targetUserId);
        return ResponseEntity.ok(ApiResponse.success(null, "User unblocked successfully"));
    }

    @PostMapping("/remove-connection/{targetUserId}")
    @RateLimit(
            prefix = "connections::remove:",
            limit = 20,
            windowSeconds = 60,
            strategy = RateLimitKeyStrategy.PER_USER_ID
    )
    public ResponseEntity<ApiResponse<Void>> removeConnection(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @PathVariable(name = "targetUserId") UUID targetUserId
    ) {
        connectionService.removeConnection(principal.getId(), targetUserId);
        return ResponseEntity.ok(ApiResponse.success(null, "Connection removed successfully"));
    }


}
