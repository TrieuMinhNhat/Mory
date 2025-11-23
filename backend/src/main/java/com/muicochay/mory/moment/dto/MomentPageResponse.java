package com.muicochay.mory.moment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;

import java.time.Instant;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MomentPageResponse {
    private List<MomentResponse> moments;
    private boolean hasNext;
    private Instant nextCursorCreatedAt;
    private ObjectId nextCursorId;
}
