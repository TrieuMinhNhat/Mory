package com.muicochay.mory.user.dto;

import com.muicochay.mory.connection.dto.ConnectionResponse;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserProfileResponse {

    private String displayName;
    private String avatarUrl;
    private Integer connectionCount;
    private Boolean hasEmailPasswordProvider;
    private ConnectionResponse connection;
}
