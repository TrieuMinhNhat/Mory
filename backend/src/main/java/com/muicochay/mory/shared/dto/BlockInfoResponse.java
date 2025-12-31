package com.muicochay.mory.shared.dto;

import lombok.*;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BlockInfoResponse {
    private String level;
    private Instant unblockAt;
    private boolean permanent;
}
