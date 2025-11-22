package com.muicochay.mory.shared.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * Configuration class that enables asynchronous execution and defines a custom thread pool executor
 * for handling email-related tasks.
 *
 * <p>This is particularly useful for sending emails without blocking the main application thread.</p>
 *
 * <p>To use this executor, annotate your method with {@code @Async("emailTaskExecutor")}.</p>
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "emailTaskExecutor")
    public Executor emailTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(50);
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.setThreadNamePrefix("Email-");
        executor.initialize();
        return executor;
    }
}
