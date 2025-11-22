package com.muicochay.mory.admin.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserStatsSummary {

    private StatsWithDiff totalUsers;
    private StatsWithDiff activeUsers;
    private StatsWithDiff pendingUsers;
    private StatsWithDiff deletedUsers;
}
