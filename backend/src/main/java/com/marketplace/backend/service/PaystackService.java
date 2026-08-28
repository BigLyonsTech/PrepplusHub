package com.marketplace.backend.service;

import com.marketplace.backend.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Verifies a Paystack transaction server-side after the frontend completes
 * payment via the inline popup. Never trust the client's "payment succeeded"
 * callback alone — this re-checks status and amount against Paystack's own
 * records before an order is ever created.
 */
@Service
public class PaystackService {

    public record VerifiedTransaction(boolean success, long amountKobo) {}

    private final RestClient restClient;
    private final String secretKey;

    public PaystackService(@Value("${paystack.secret-key:}") String secretKey) {
        this.secretKey = secretKey;
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(8000);
        requestFactory.setReadTimeout(8000);
        this.restClient = RestClient.builder()
                .baseUrl("https://api.paystack.co")
                .requestFactory(requestFactory)
                .defaultHeader("Authorization", "Bearer " + secretKey)
                .build();
    }

    public boolean isConfigured() {
        return !secretKey.isBlank();
    }

    @SuppressWarnings("unchecked")
    public VerifiedTransaction verify(String reference) {
        if (!isConfigured()) {
            throw new ApiException("Payments aren't configured", HttpStatus.SERVICE_UNAVAILABLE);
        }
        if (reference == null || reference.isBlank()) {
            throw new ApiException("Missing payment reference", HttpStatus.BAD_REQUEST);
        }

        Map<String, Object> body;
        try {
            body = restClient.get()
                    .uri("/transaction/verify/{reference}", reference)
                    .retrieve()
                    .body(Map.class);
        } catch (Exception e) {
            throw new ApiException("Could not verify payment with Paystack", HttpStatus.BAD_GATEWAY);
        }

        // Top-level "status" is a boolean — whether the API call itself worked.
        // data.status is the actual payment outcome ("success"/"failed"/"abandoned").
        if (body == null || !Boolean.TRUE.equals(body.get("status"))) {
            throw new ApiException("Payment verification failed", HttpStatus.BAD_REQUEST);
        }
        Map<String, Object> data = (Map<String, Object>) body.get("data");
        if (data == null) {
            throw new ApiException("Payment verification failed", HttpStatus.BAD_REQUEST);
        }

        boolean success = "success".equals(data.get("status"));
        Number amountKobo = (Number) data.get("amount");
        return new VerifiedTransaction(success, amountKobo != null ? amountKobo.longValue() : 0);
    }
}
