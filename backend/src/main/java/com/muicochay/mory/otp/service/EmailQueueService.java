package com.muicochay.mory.otp.service;


import com.fantus.mory.otp.config.RabbitMQConfig;
import com.fantus.mory.otp.dto.EmailJob;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailQueueService {
    private final RabbitTemplate rabbitTemplate;

    public void pushToMailQueue(EmailJob emailJob) {
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EMAIL_EXCHANGE,
                RabbitMQConfig.EMAIL_ROUTING_KEY,
                emailJob
        );
    }
}

