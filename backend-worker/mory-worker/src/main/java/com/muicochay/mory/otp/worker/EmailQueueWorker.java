package com.muicochay.mory.otp.worker;

import com.muicochay.mory.otp.config.RabbitMQConfig;
import com.muicochay.mory.otp.dto.EmailJob;
import com.muicochay.mory.otp.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmailQueueWorker {
    private final EmailService emailService;

    @RabbitListener(queues = RabbitMQConfig.EMAIL_QUEUE, containerFactory = "rabbitListenerContainerFactory")
    public void receiveEmailJob(@Payload EmailJob job) {
        try {
            emailService.sendMail(
                    job.getEmail(),
                    job.getSubject(),
                    job.getTemplateType(),
                    job.getVariables()
            );
            log.info("Sent email to {}", job.getEmail());
        } catch (Exception e) {
            log.warn("Failed to send email for job: {}, error: {}", job, e.getMessage(), e);
        }
    }
}

