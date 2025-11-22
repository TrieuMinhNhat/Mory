package com.muicochay.mory.admin.dto.user;

import com.muicochay.mory.shared.enums.BlockLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class BlockUserRequest {

    private BlockLevel blockLevel;
}
