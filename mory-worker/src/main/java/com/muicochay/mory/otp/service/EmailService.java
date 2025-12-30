package com.muicochay.mory.otp.service;

import com.muicochay.mory.otp.enums.EmailTemplateType;
import com.muicochay.mory.shared.exception.otp.EmailEx;
import com.muicochay.mory.shared.exception.otp.MissingEmailVariablesEx;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.File;
import java.time.Year;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender javaMailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String sender;

    @Value("${spring.application.name}")
    private String appName;

    @Async("emailTaskExecutor")
    @Retryable(
            retryFor = { MailException.class, EmailEx.class },
            noRetryFor = { IllegalArgumentException.class, MissingEmailVariablesEx.class},
            maxAttempts = 3,
            backoff = @Backoff(delay = 2000)
    )
    public void sendMail(
            String email,
            String subject,
            EmailTemplateType templateType,
            Map<String, Object> variables
    ) {
        try {
            List<String> missingVars = templateType.getRequiredVariables().stream()
                    .filter(key -> !variables.containsKey(key))
                    .toList();

            if (!missingVars.isEmpty()) {
                throw new MissingEmailVariablesEx("Missing variables: " + missingVars + " for template: " + templateType);
            }

            Context context = new Context();
            String emailLocalPart = email.split("@")[0];
            context.setVariable("email", emailLocalPart);
            variables.forEach(context::setVariable);
            context.setVariable("year", Year.now().getValue());
            context.setVariable("appName", appName);
            String htmlContent = templateEngine.process(templateType.getFullPath(), context);
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(new InternetAddress(sender, appName));
            helper.setTo(email);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            FileSystemResource res = new FileSystemResource(new File("src/main/resources/static/logo.png"));
            helper.addInline("logoImage", res);

            javaMailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
            throw new EmailEx("Failed to send email to: " + email);
        }
    }
}
