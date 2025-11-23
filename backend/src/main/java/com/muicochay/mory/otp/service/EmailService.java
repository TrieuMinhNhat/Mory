package com.muicochay.mory.otp.service;

import com.fantus.mory.otp.enums.EmailTemplateType;
import com.fantus.mory.shared.exception.otp.EmailEx;
import com.fantus.mory.shared.exception.otp.MissingEmailVariablesEx;
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

/**
 * Service responsible for sending HTML emails using predefined templates.
 * <p>
 * This service supports asynchronous email sending with retry logic using Spring's {@code @Async} and {@code @Retryable}.
 * </p>
 * <p>
 * It uses Thymeleaf as the template engine and supports injecting variables into the email templates.
 * </p>
 *
 * <p>Available templates are defined in {@link EmailTemplateType}.</p>
 *
 * <p>This service also ensures that all required variables defined by the template type are present
 * before attempting to render and send the email.</p>
 */
@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender javaMailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String sender;

    @Value("${spring.application.name}")
    private String appName;


    /**
     * Sends an HTML email using a specified template and variables.
     *
     * @param email         the recipient's email address.
     * @param subject       the subject of the email.
     * @param templateType  the {@link EmailTemplateType} representing the email template to be used.
     * @param variables     a map of variables to inject into the template.
     *                      Must contain all required variables specified by the template.
     * @throws EmailEx                   if the email fails to send.
     * @throws MissingEmailVariablesEx   if one or more required variables are missing from the map.
     * @throws IllegalArgumentException  if arguments are invalid (no retry will be attempted).
     */
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
