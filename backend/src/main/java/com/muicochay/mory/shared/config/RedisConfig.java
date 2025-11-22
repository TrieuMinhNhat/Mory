package com.muicochay.mory.shared.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * Configuration class for customizing RedisTemplate.
 *
 * <p>This configuration defines how keys and values are serialized when interacting with Redis.</p>
 *
 * <p>Specifically:
 * <ul>
 *   <li>Keys and Hash keys are serialized as plain strings.</li>
 *   <li>Values and Hash values are serialized as JSON using Jackson.</li>
 * </ul>
 *
 * <p>This setup improves readability and interoperability of stored data in Redis.</p>
 */
@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);

        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());

        return template;
    }
}
