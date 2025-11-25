package com.muicochay.mory.moment.dto;

import com.muicochay.mory.shared.enums.Visibility;
import com.muicochay.mory.user.dto.UserPreviewResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MomentInStoryDto {
    private UUID id;
    private UserPreviewResponse user;
    private String mediaUrl;
    private String caption;
    private Visibility visibility;
    // BEFORE_AFTER
    private Integer position;
    // JOURNEY && CHALLENGE
    private Integer dayIndex;
    private LocalDateTime createdAt;
    private LocalDateTime lastModifiedAt;
    private boolean milestone;
    private List<MomentTagDto> tags;
}
