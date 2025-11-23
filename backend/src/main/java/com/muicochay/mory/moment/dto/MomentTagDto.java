package com.muicochay.mory.moment.dto;

import com.fantus.mory.user.dto.UserPreviewResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MomentTagDto {
    private UUID id;
    private UserPreviewResponse user;
}
