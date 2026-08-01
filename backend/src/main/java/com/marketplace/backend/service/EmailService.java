package com.marketplace.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final boolean configured;
    private final String from;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${spring.mail.host:}") String host,
            @Value("${spring.mail.username:}") String username,
            @Value("${spring.mail.password:}") String password,
            @Value("${app.mail.from:PrepplusHub <no-reply@prepplushub.com>}") String from
    ) {
        this.mailSender = mailSender;
        this.configured = !host.isBlank() && !username.isBlank() && !password.isBlank();
        this.from = from;
    }

    public boolean isConfigured() {
        return configured;
    }

    /** Returns true if the email was actually sent. */
    public boolean sendOtp(String toEmail, String otp) {
        if (!configured) return false;
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(toEmail);
            message.setSubject("Your PrepplusHub verification code");
            message.setText(
                    "Your verification code is: " + otp + "\n\n"
                    + "This code expires in 10 minutes. If you didn't request this, you can ignore this email."
            );
            mailSender.send(message);
            return true;
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}", toEmail, e);
            return false;
        }
    }
}
