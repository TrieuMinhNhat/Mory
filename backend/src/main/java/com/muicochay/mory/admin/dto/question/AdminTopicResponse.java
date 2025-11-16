package com.muicochay.mory.admin.dto.question;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AdminTopicResponse {

    private Integer id;
    private String nameEN;
    private String nameVI;
    private String descriptionEN;
    private String descriptionVI;
}
