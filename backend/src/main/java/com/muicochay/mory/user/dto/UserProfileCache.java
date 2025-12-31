package com.muicochay.mory.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserProfileCache {
    private UUID id;
    private String displayName;
    private String avatarUrl;
    private String timezone;
    private String locale;
}
