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
    private final String adminEmail;
    private final String frontendUrl;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${spring.mail.host:}") String host,
            @Value("${spring.mail.username:}") String username,
            @Value("${spring.mail.password:}") String password,
            @Value("${app.mail.from:PrepplusHub <no-reply@prepplushub.com>}") String from,
            @Value("${app.notifications.admin-email:}") String adminEmail,
            @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl
    ) {
        this.mailSender = mailSender;
        this.configured = !host.isBlank() && !username.isBlank() && !password.isBlank();
        this.from = from;
        this.adminEmail = adminEmail;
        this.frontendUrl = frontendUrl;
    }

    public boolean isConfigured() {
        return configured;
    }

    /** Returns true if the email was actually sent. */
    public boolean sendOtp(String toEmail, String otp) {
        return send(
                toEmail,
                "Your PrepplusHub verification code",
                "Your verification code is: " + otp + "\n\n"
                + "This code expires in 10 minutes. If you didn't request this, you can ignore this email."
        );
    }

    public boolean sendOrderConfirmation(String toEmail, String orderId, double total) {
        return send(
                toEmail,
                "Your PrepplusHub order is confirmed",
                "Thanks for your order!\n\n"
                + "Order #" + shortId(orderId) + " — total ₦" + format(total) + "\n\n"
                + "Track it any time: " + frontendUrl + "/orders/" + orderId
        );
    }

    public boolean notifyAdminNewOrder(String orderId, double total, String customerDescriptor) {
        if (adminEmail.isBlank()) return false;
        return send(
                adminEmail,
                "New order on PrepplusHub — ₦" + format(total),
                "New order #" + shortId(orderId) + " from " + customerDescriptor + " — total ₦" + format(total) + "\n\n"
                + "Open the admin dashboard: " + frontendUrl + "/admin?section=" + encode("Activity Log")
        );
    }

    public boolean notifyAdminNewVendorApplication(String businessName, String vendorEmail) {
        if (adminEmail.isBlank()) return false;
        return send(
                adminEmail,
                "New vendor application: " + businessName,
                businessName + " (" + vendorEmail + ") just submitted a vendor application.\n\n"
                + "Review it: " + frontendUrl + "/admin?section=" + encode("Vendor Queue")
        );
    }

    private boolean send(String toEmail, String subject, String body) {
        if (!configured) return false;
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            return true;
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", toEmail, subject, e);
            return false;
        }
    }

    private static String shortId(String orderId) {
        return orderId != null && orderId.length() > 8 ? orderId.substring(orderId.length() - 8) : orderId;
    }

    private static String format(double amount) {
        return String.format("%,.0f", amount);
    }

    private static String encode(String value) {
        return java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8);
    }
}
