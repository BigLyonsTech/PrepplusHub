package com.marketplace.backend.service;

import com.marketplace.backend.model.FulfillmentType;
import com.marketplace.backend.model.Order;
import com.marketplace.backend.model.OrderStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.util.HtmlUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Sends mail via Resend's HTTP API rather than raw SMTP — Render blocks
 * outbound SMTP ports (25/465/587) on its plans, so a JavaMailSender-based
 * approach can never connect there regardless of credentials. An HTTPS API
 * call sidesteps that entirely.
 *
 * Every notification except the OTP is @Async: they're fire-and-forget, and
 * running them inline used to add up to 5s per email to checkout requests
 * that already wait on Paystack — long enough to trip the frontend's 15s
 * timeout after the buyer had already paid. The OTP stays synchronous
 * because AuthService needs to know whether it actually went out.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final RestClient restClient;
    private final boolean configured;
    private final String from;
    private final String replyTo;
    private final String adminEmail;
    private final String frontendUrl;

    public EmailService(
            @Value("${app.notifications.resend-api-key:}") String apiKey,
            @Value("${app.mail.from:PrepplusHub <onboarding@resend.dev>}") String from,
            @Value("${app.mail.reply-to:}") String replyTo,
            @Value("${app.notifications.admin-email:}") String adminEmail,
            @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl,
            @Value("${app.mail.resend-base-url:https://api.resend.com}") String resendBaseUrl
    ) {
        this.configured = !apiKey.isBlank();
        this.from = from;
        this.replyTo = replyTo;
        this.adminEmail = adminEmail;
        this.frontendUrl = frontendUrl;

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(5000);
        requestFactory.setReadTimeout(5000);
        this.restClient = RestClient.builder()
                .baseUrl(resendBaseUrl)
                .requestFactory(requestFactory)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build();
    }

    public boolean isConfigured() {
        return configured;
    }

    /** Returns true if the email was actually sent. Synchronous on purpose — see class comment. */
    public boolean sendOtp(String toEmail, String otp) {
        return send(
                toEmail,
                "Your PrepplusHub verification code",
                layout(
                        "Your verification code",
                        "<p style=\"font-size:32px;font-weight:700;letter-spacing:6px;margin:8px 0 16px\">" + esc(otp) + "</p>"
                                + "<p>This code expires in 10 minutes. If you didn't request it, you can ignore this email.</p>",
                        null, null
                ),
                "Your verification code is: " + otp + "\n\n"
                        + "This code expires in 10 minutes. If you didn't request this, you can ignore this email."
        );
    }

    // ---- Customers ----

    @Async
    public void sendOrderConfirmation(String toEmail, String customerName, Order order) {
        String trackUrl = trackingUrl(order);
        String body = "<p>Hi " + esc(firstName(customerName)) + ", thanks for shopping with PrepplusHub! "
                + "We've received your payment and your order is being prepared.</p>"
                + orderSummaryHtml(order)
                + fulfilmentHtml(order);
        send(
                toEmail,
                "Order confirmed — #" + shortId(order.getId()),
                layout("Your order is confirmed", body, "Track your order", trackUrl),
                "Thanks for your order!\n\n"
                        + orderSummaryText(order)
                        + "\nTrack it any time: " + trackUrl
        );
    }

    @Async
    public void sendOrderStatusUpdate(String toEmail, String customerName, Order order) {
        OrderStatus status = order.getStatus();
        boolean pickup = order.getFulfillmentType() == FulfillmentType.PICKUP;
        String headline = switch (status) {
            // Pickup wording mirrors the site's labels (lib/orderStatus.js):
            // OUT_FOR_DELIVERY = "Ready for pickup", DELIVERED = "Picked up".
            case SHIPPED -> pickup ? "Your order is being prepared for pickup" : "Your order has shipped";
            case OUT_FOR_DELIVERY -> pickup ? "Your order is ready for pickup" : "Your order is out for delivery";
            case DELIVERED -> pickup ? "Your order has been collected" : "Your order has been delivered";
            case CANCELLED -> "Your order has been cancelled";
            default -> "Your order is being processed";
        };
        String detail = switch (status) {
            case SHIPPED -> pickup
                    ? "We'll email you again as soon as it's ready to collect."
                    : "It's on its way to " + esc(order.getDeliveryAddress().getAddress()) + ".";
            case OUT_FOR_DELIVERY -> pickup
                    ? "Come by the store during opening hours to collect it: " + esc(order.getDeliveryAddress().getAddress()) + "."
                    : "Our rider is on the way — please keep your phone nearby.";
            case DELIVERED -> "We hope you love it. Thanks for shopping with PrepplusHub!";
            case CANCELLED -> "If you've already paid, your refund will be processed to your original payment method. "
                    + "Reply to this email if you have any questions.";
            default -> "";
        };
        String trackUrl = trackingUrl(order);
        send(
                toEmail,
                headline + " — #" + shortId(order.getId()),
                layout(headline, "<p>Hi " + esc(firstName(customerName)) + ",</p><p>" + detail + "</p>"
                        + orderSummaryHtml(order), "View order", trackUrl),
                headline + "\n\n" + HtmlUtils.htmlUnescape(detail) + "\n\n" + orderSummaryText(order)
                        + "\nView your order: " + trackUrl
        );
    }

    // ---- Vendors ----

    /** One email per vendor, listing only that vendor's lines from the order. */
    @Async
    public void notifyVendorNewOrder(String vendorEmail, String vendorName, Order order, List<Order.OrderLine> vendorLines) {
        StringBuilder rows = new StringBuilder();
        StringBuilder text = new StringBuilder();
        double vendorTotal = 0;
        for (Order.OrderLine line : vendorLines) {
            double lineTotal = line.getUnitPrice() * line.getQuantity();
            vendorTotal += lineTotal;
            rows.append(itemRow(line.getProductName() + " × " + line.getQuantity(), lineTotal));
            text.append("- ").append(line.getProductName()).append(" x").append(line.getQuantity())
                    .append(" — ₦").append(format(lineTotal)).append('\n');
        }
        rows.append(totalRow("Your items", vendorTotal));
        String how = order.getFulfillmentType() == FulfillmentType.PICKUP
                ? "The customer will collect in store."
                : "Deliver to: " + esc(order.getDeliveryAddress().getFullName()) + ", "
                + esc(order.getDeliveryAddress().getAddress()) + " (" + esc(order.getDeliveryAddress().getPhone()) + ")";
        String ordersUrl = frontendUrl + "/vendor/orders";
        send(
                vendorEmail,
                "New order to fulfil — #" + shortId(order.getId()),
                layout("You have a new order", "<p>Hi " + esc(firstName(vendorName)) + ", a customer just paid for:</p>"
                        + table(rows.toString()) + "<p>" + how + "</p>", "Open your orders", ordersUrl),
                "New paid order #" + shortId(order.getId()) + ":\n" + text
                        + "Your items total: ₦" + format(vendorTotal) + "\n\n" + ordersUrl
        );
    }

    @Async
    public void notifyVendorApproved(String vendorEmail, String vendorName) {
        String url = frontendUrl + "/vendor/dashboard";
        send(
                vendorEmail,
                "You're approved to sell on PrepplusHub",
                layout("Welcome aboard!", "<p>Hi " + esc(firstName(vendorName)) + ", your vendor application has been "
                        + "approved. You can start listing products right away.</p>", "Go to your dashboard", url),
                "Your vendor application has been approved. Start listing products: " + url
        );
    }

    @Async
    public void notifyVendorRejected(String vendorEmail, String vendorName, String reason) {
        String url = frontendUrl + "/onboarding/vendor";
        send(
                vendorEmail,
                "Update on your PrepplusHub vendor application",
                layout("Your application needs changes", "<p>Hi " + esc(firstName(vendorName)) + ", we couldn't approve "
                        + "your vendor application yet.</p><p><strong>Reason:</strong> " + esc(reason) + "</p>"
                        + "<p>You can update your details and resubmit.</p>", "Update application", url),
                "We couldn't approve your vendor application yet.\nReason: " + reason + "\n\nResubmit: " + url
        );
    }

    // ---- Admin ----

    @Async
    public void notifyAdminNewOrder(Order order, String customerDescriptor) {
        if (adminEmail.isBlank()) return;
        String url = frontendUrl + "/admin?section=" + encode("Activity Log");
        send(
                adminEmail,
                "New order on PrepplusHub — ₦" + format(order.getTotal()),
                layout("New order #" + shortId(order.getId()), "<p>From " + esc(customerDescriptor) + "</p>"
                        + orderSummaryHtml(order) + fulfilmentHtml(order), "Open admin dashboard", url),
                "New order #" + shortId(order.getId()) + " from " + customerDescriptor + "\n\n"
                        + orderSummaryText(order) + "\n" + url
        );
    }

    @Async
    public void notifyAdminNewVendorApplication(String businessName, String vendorEmail) {
        if (adminEmail.isBlank()) return;
        String url = frontendUrl + "/admin?section=" + encode("Vendor Queue");
        send(
                adminEmail,
                "New vendor application: " + businessName,
                layout("New vendor application", "<p>" + esc(businessName) + " (" + esc(vendorEmail)
                        + ") just submitted a vendor application.</p>", "Review it", url),
                businessName + " (" + vendorEmail + ") just submitted a vendor application.\n\nReview it: " + url
        );
    }

    // ---- Sending ----

    private boolean send(String toEmail, String subject, String html, String text) {
        if (!configured || toEmail == null || toEmail.isBlank()) return false;
        Map<String, Object> payload = new HashMap<>();
        payload.put("from", from);
        payload.put("to", List.of(toEmail));
        payload.put("subject", subject);
        payload.put("html", html);
        payload.put("text", text);
        if (!replyTo.isBlank()) payload.put("reply_to", replyTo);
        try {
            restClient.post()
                    .uri("/emails")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();
            return true;
        } catch (RestClientResponseException e) {
            // Resend explains rejections in the body (e.g. 403 "domain is not
            // verified") — log it, since the status code alone hid the real
            // cause last time this broke.
            log.error("Resend rejected email to {} ({}): HTTP {} {}", toEmail, subject,
                    e.getStatusCode().value(), e.getResponseBodyAsString());
            return false;
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", toEmail, subject, e);
            return false;
        }
    }

    // ---- Templates ----

    private String trackingUrl(Order order) {
        return frontendUrl + "/orders/" + order.getId()
                + (order.getTrackingToken() != null ? "?t=" + order.getTrackingToken() : "");
    }

    private String orderSummaryHtml(Order order) {
        StringBuilder rows = new StringBuilder();
        for (Order.OrderLine line : order.getItems()) {
            rows.append(itemRow(line.getProductName() + " × " + line.getQuantity(), line.getUnitPrice() * line.getQuantity()));
        }
        rows.append(itemRow("Subtotal", order.getSubtotal()));
        rows.append(itemRow("Shipping", order.getShippingFee()));
        rows.append(totalRow("Total paid", order.getTotal()));
        return "<p style=\"color:#6b7280;font-size:13px;margin:20px 0 6px\">Order #" + esc(shortId(order.getId())) + "</p>"
                + table(rows.toString());
    }

    private String orderSummaryText(Order order) {
        StringBuilder sb = new StringBuilder("Order #" + shortId(order.getId()) + "\n");
        for (Order.OrderLine line : order.getItems()) {
            sb.append("- ").append(line.getProductName()).append(" x").append(line.getQuantity())
                    .append(" — ₦").append(format(line.getUnitPrice() * line.getQuantity())).append('\n');
        }
        sb.append("Subtotal: ₦").append(format(order.getSubtotal())).append('\n');
        sb.append("Shipping: ₦").append(format(order.getShippingFee())).append('\n');
        sb.append("Total: ₦").append(format(order.getTotal())).append('\n');
        return sb.toString();
    }

    private String fulfilmentHtml(Order order) {
        Order.DeliveryAddress addr = order.getDeliveryAddress();
        if (addr == null) return "";
        String label = order.getFulfillmentType() == FulfillmentType.PICKUP ? "Pickup from" : "Delivering to";
        return "<p style=\"margin-top:20px\"><strong>" + label + ":</strong><br>"
                + (order.getFulfillmentType() == FulfillmentType.PICKUP ? "" : esc(addr.getFullName()) + "<br>")
                + esc(addr.getAddress()) + "</p>";
    }

    private static String table(String rows) {
        return "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" "
                + "style=\"border-collapse:collapse;font-size:14px\">" + rows + "</table>";
    }

    private static String itemRow(String label, double amount) {
        return "<tr><td style=\"padding:8px 0;border-bottom:1px solid #eef0ee\">" + esc(label) + "</td>"
                + "<td align=\"right\" style=\"padding:8px 0;border-bottom:1px solid #eef0ee;white-space:nowrap\">&#8358;"
                + format(amount) + "</td></tr>";
    }

    private static String totalRow(String label, double amount) {
        return "<tr><td style=\"padding:10px 0;font-weight:700\">" + esc(label) + "</td>"
                + "<td align=\"right\" style=\"padding:10px 0;font-weight:700;white-space:nowrap\">&#8358;" + format(amount) + "</td></tr>";
    }

    /** Table-based, inline-styled layout — the only thing that renders consistently across Gmail/Outlook/Apple Mail. */
    private String layout(String heading, String bodyHtml, String ctaLabel, String ctaUrl) {
        String cta = ctaLabel == null ? "" :
                "<p style=\"margin:28px 0 8px\"><a href=\"" + esc(ctaUrl) + "\" style=\"display:inline-block;"
                        + "background:#16a34a;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 24px;"
                        + "border-radius:999px\">" + esc(ctaLabel) + "</a></p>";
        return "<!doctype html><html><head><meta charset=\"utf-8\">"
                + "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"></head><body style=\"margin:0;background:#f4f6f4;font-family:Arial,Helvetica,sans-serif;color:#111827\">"
                + "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#f4f6f4;padding:24px 12px\">"
                + "<tr><td align=\"center\"><table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" "
                + "style=\"max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden\">"
                + "<tr><td style=\"background:#0b0b12;padding:18px 28px;color:#ffffff;font-size:18px;font-weight:700\">"
                + "Prepplus<span style=\"color:#4ade80\">Hub</span></td></tr>"
                + "<tr><td style=\"padding:28px;font-size:15px;line-height:1.55\">"
                + "<h1 style=\"font-size:22px;margin:0 0 16px\">" + esc(heading) + "</h1>"
                + bodyHtml + cta
                + "</td></tr>"
                + "<tr><td style=\"padding:18px 28px;background:#f9faf9;color:#6b7280;font-size:12px\">"
                + "PrepplusHub by Prepplus Global Limited &middot; <a href=\"" + esc(frontendUrl) + "\" style=\"color:#6b7280\">"
                + esc(frontendUrl.replaceFirst("^https?://", "")) + "</a></td></tr>"
                + "</table></td></tr></table></body></html>";
    }

    private static String esc(String value) {
        return value == null ? "" : HtmlUtils.htmlEscape(value);
    }

    private static String firstName(String name) {
        if (name == null || name.isBlank()) return "there";
        return name.trim().split("\\s+")[0];
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
