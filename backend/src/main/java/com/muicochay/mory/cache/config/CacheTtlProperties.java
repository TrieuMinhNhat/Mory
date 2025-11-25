package com.muicochay.mory.cache.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Binds custom TTL (time-to-live) settings for each cache name from application
 * properties.
 *
 * <p>
 * Example usage in <code>application.yml</code>:</p>
 *
 * <pre>{@code
 * custom:
 *   cache:
 *     ttl:
 *       userCache: 5m
 *       sessionCache: 30m
 * }</pre>
 */
@Component
@ConfigurationProperties(prefix = "custom.cache.ttl")
@Getter
@Setter
public class CacheTtlProperties {

    private Map<String, Duration> ttl = new HashMap<>();

    public Duration getTtlFor(String cacheName, Duration defaultTtl) {
        return ttl.getOrDefault(cacheName, defaultTtl);
    }
}
