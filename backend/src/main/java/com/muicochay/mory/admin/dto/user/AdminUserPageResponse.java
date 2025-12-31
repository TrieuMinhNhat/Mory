package com.muicochay.mory.admin.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AdminUserPageResponse {
    private List<AdminUserResponse> users;
    private int totalPages;
    private int currentPage;
    private boolean hasNext;
}
