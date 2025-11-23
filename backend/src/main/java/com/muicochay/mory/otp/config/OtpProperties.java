package com.muicochay.mory.otp.config;


import com.fantus.mory.otp.enums.OtpType;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.EnumMap;
import java.util.Map;

@Data
@Configuration
@ConfigurationProperties(prefix = "otp")
public class OtpProperties {
    private Map<OtpType, Integer> ttlSeconds = new EnumMap<>(OtpType.class);
}
