package com.muicochay.mory.shared.dto;

import com.muicochay.mory.shared.enums.Visibility;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UpdateVisibilityRequest {
    private Visibility visibility;
}
