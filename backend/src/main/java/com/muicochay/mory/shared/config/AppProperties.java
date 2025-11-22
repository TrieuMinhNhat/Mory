package com.muicochay.mory.shared.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app")
@Getter
@Setter
public class AppProperties {
    private String frontendUrl;
    private String backendUrl;
    private String resetPasswordPath;
    private String appName;
}
