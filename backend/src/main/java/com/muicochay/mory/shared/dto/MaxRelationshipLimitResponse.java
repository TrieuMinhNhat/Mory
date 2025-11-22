package com.muicochay.mory.shared.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MaxRelationshipLimitResponse {
    private boolean selfExceeded;
}
