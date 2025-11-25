package com.muicochay.mory.otp.dto;

import com.muicochay.mory.otp.enums.EmailTemplateType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailJob {
    String email;
    String subject;
    EmailTemplateType templateType;
    Map<String, Object> variables = new HashMap<>();
}
