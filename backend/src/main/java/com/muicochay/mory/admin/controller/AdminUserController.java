package com.muicochay.mory.admin.controller;

import com.muicochay.mory.admin.dto.user.*;
import com.muicochay.mory.admin.service.AdminUserService;
import com.muicochay.mory.auth.model.AuthUserPrincipal;
import com.muicochay.mory.user.enums.RoleCode;
import com.muicochay.mory.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<ApiResponse<AdminUserPageResponse>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(required = false) RoleCode role,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @AuthenticationPrincipal AuthUserPrincipal principal
    ) {
        AdminUserPageResponse result = adminUserService.getUsers(
                principal.getId(), page, size, keyword, role, active, sortBy, direction
        );
        return ResponseEntity.ok(ApiResponse.success(result, "Get Users Successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminUserResponse>> getUserDetail(@PathVariable UUID id) {
        AdminUserResponse user = adminUserService.getUserDetail(id);
        return ResponseEntity.ok(ApiResponse.success(user, "Get User Detail Successfully"));
    }

    @PatchMapping("/{id}/block")
    public ResponseEntity<ApiResponse<Void>> blockUser(
            @PathVariable UUID id,
            @RequestBody BlockUserRequest blockUserRequest
    ) {
        adminUserService.blockUser(id, blockUserRequest.getBlockLevel());
        return ResponseEntity.ok(ApiResponse.success(null, "User blocked successfully"));
    }

    @PatchMapping("/{id}/unblock")
    public ResponseEntity<ApiResponse<Void>> unblockUser(
            @PathVariable UUID id
    ) {
        adminUserService.unblockUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "User unblocked successfully"));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<UserStatsSummary>> getUserStatistics() {
        UserStatsSummary stats = adminUserService.getUserStatistics();
        return ResponseEntity.ok(ApiResponse.success(stats, "Fetched user statistics"));
    }

    @GetMapping("/stats/daily")
    public ResponseEntity<ApiResponse<List<UserDailyCount>>> getUserCountByDateRange(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {
        List<UserDailyCount> stats = adminUserService.getUserCountByDateRange(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(stats, "Fetched daily user count"));
    }

}
