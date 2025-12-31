package com.muicochay.mory.cache.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Configures Redis-based caching with custom TTLs per cache and JSON serialization.
 */
@Configuration
@EnableConfigurationProperties(CacheTtlProperties.class)
public class CacheConfig {
    private static final RedisSerializationContext.SerializationPair<Object> JSON_SERIALIZER =
            RedisSerializationContext.SerializationPair.fromSerializer(customSerializer());

    private static GenericJackson2JsonRedisSerializer customSerializer() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        mapper.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY
        );

        return new GenericJackson2JsonRedisSerializer(mapper);
    }

    private static final RedisSerializationContext.SerializationPair<String> STRING_SERIALIZER =
            RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer());

    private RedisCacheConfiguration ttlConfig(Duration ttl) {
        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(ttl)
                .serializeKeysWith(STRING_SERIALIZER)
                .serializeValuesWith(JSON_SERIALIZER);
    }

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory factory, CacheTtlProperties cacheTtlProperties) {
        Map<String, RedisCacheConfiguration> configurationMap = new HashMap<>();

        cacheTtlProperties.getTtl().forEach((cacheName, ttl) ->
                configurationMap.put(cacheName, ttlConfig(ttl))
        );

        Duration defaultTtl = cacheTtlProperties.getTtlFor("default", Duration.ofMinutes(10));

        return RedisCacheManager.builder(factory)
                .withInitialCacheConfigurations(configurationMap)
                .cacheDefaults(ttlConfig(defaultTtl))
                .build();
    }
}
