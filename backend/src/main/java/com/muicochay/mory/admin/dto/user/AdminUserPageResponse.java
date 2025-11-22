package com.muicochay.mory.admin.dto.user;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
