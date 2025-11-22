package com.muicochay.mory.admin.service;

import com.muicochay.mory.admin.dto.user.*;
import com.muicochay.mory.admin.mapper.AdminUserMapper;
import com.muicochay.mory.admin.repository.AdminUserRepository;
import com.muicochay.mory.admin.specification.AdminUserSpecification;
import com.muicochay.mory.auth.enums.AuthProvider;
import com.muicochay.mory.user.enums.RoleCode;
import com.muicochay.mory.shared.enums.BlockLevel;
import com.muicochay.mory.shared.exception.global.ResourcesNotFoundEx;
import com.muicochay.mory.shared.service.BlockedUserService;
import com.muicochay.mory.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final AdminUserRepository adminUserRepository;
    private final AdminUserMapper adminUserMapper;

    private final BlockedUserService blockedUserService;

    public AdminUserPageResponse getUsers(
            UUID requesterId,
            int page, int size, String keyword, RoleCode role, Boolean active,
            String sortBy, String direction
    ) {
        Sort sort = direction.equalsIgnoreCase("acs")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<User> spec = AdminUserSpecification.hasKeyword(keyword)
                .and(AdminUserSpecification.hasRole(role))
                .and(AdminUserSpecification.isActive(active))
                .and(AdminUserSpecification.excludeUser(requesterId));

        Page<User> userPage = adminUserRepository.findAll(spec, pageable);

        List<AdminUserResponse> users = userPage.map(adminUserMapper::toDto)
                .getContent()
                .stream()
                .peek(user -> user.setBlocked(blockedUserService.isBlocked(user.getId())))
                .toList();

        return AdminUserPageResponse.builder()
                .users(users)
                .totalPages(userPage.getTotalPages())
                .currentPage(page)
                .hasNext(userPage.hasNext())
                .build();
    }

    public AdminUserResponse getUserDetail(UUID id) {
        User user = adminUserRepository.findById(id)
                .orElseThrow(() -> new ResourcesNotFoundEx("User not found with id: " + id));
        return adminUserMapper.toDto(user);
    }

    public void blockUser(UUID userId, BlockLevel blockLevel) {
        blockedUserService.block(userId, blockLevel);
    }

    public void unblockUser(UUID userId) {
        blockedUserService.unblock(userId);
    }

    public UserStatsSummary getUserStatistics() {
        long totalUsers = adminUserRepository.countAllUsers();
        long activeUsers = adminUserRepository.countActiveUsers(AuthProvider.GOOGLE, AuthProvider.EMAIL_OTP);
        long pendingUsers = totalUsers - activeUsers;
        long deletedUsers = adminUserRepository.countDeletedUsers();

        // Lấy số liệu của tháng trước
        long totalUsersLastMonth = adminUserRepository.countAllUsersLastMonth();
        long activeUsersLastMonth = adminUserRepository.countActiveUsersLastMonth();
        long pendingUsersLastMonth = totalUsersLastMonth - activeUsersLastMonth;
        long deletedUsersLastMonth = adminUserRepository.countDeletedUsersLastMonth();

        StatsWithDiff total = StatsWithDiff.builder()
                .value(totalUsers)
                .diff(totalUsers - totalUsersLastMonth)
                .build();
        StatsWithDiff active = StatsWithDiff.builder()
                .value(activeUsers)
                .diff(activeUsers - activeUsersLastMonth)
                .build();
        StatsWithDiff pending = StatsWithDiff.builder()
                .value(pendingUsers)
                .diff(pendingUsers - pendingUsersLastMonth)
                .build();
        StatsWithDiff deleted = StatsWithDiff.builder()
                .value(deletedUsers)
                .diff(deletedUsers - deletedUsersLastMonth)
                .build();

        return UserStatsSummary.builder()
                .totalUsers(total)
                .activeUsers(active)
                .pendingUsers(pending)
                .deletedUsers(deleted)
                .build();
    }

    public List<UserDailyCount> getUserCountByDateRange(LocalDate startDate, LocalDate endDate) {
        ZoneId zone = ZoneId.of("Asia/Ho_Chi_Minh");

        Instant startInstant = startDate.atStartOfDay(zone).toInstant();
        Instant endInstant = endDate.plusDays(1).atStartOfDay(zone).toInstant(); // exclusive

        List<Object[]> rows = adminUserRepository.countUsersByDateRange(startInstant, endInstant);

        return rows.stream()
                .map(row -> new UserDailyCount(
                ((java.sql.Date) row[0]).toLocalDate(),
                ((Number) row[1]).longValue()
        ))
                .toList();
    }
}
