package com.marketplace.backend.service;

import com.marketplace.backend.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Verifies a Google Identity Services ID token server-side via Google's
 * tokeninfo endpoint. Only the OAuth Client ID is needed here (it's public —
 * meant to be embedded in frontend JS) since this is the ID-token flow, not
 * the authorization-code flow that would need a client secret.
 */
@Service
public class GoogleAuthService {

    public record TokenInfo(String email, String name) {}

    private final RestClient restClient;
    private final String clientId;

    public GoogleAuthService(@Value("${google.oauth.client-id:}") String clientId) {
        this.clientId = clientId;
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(4000);
        requestFactory.setReadTimeout(4000);
        this.restClient = RestClient.builder()
                .baseUrl("https://oauth2.googleapis.com")
                .requestFactory(requestFactory)
                .build();
    }

    public boolean isConfigured() {
        return !clientId.isBlank();
    }

    @SuppressWarnings("unchecked")
    public TokenInfo verify(String idToken) {
        if (!isConfigured()) {
            throw new ApiException("Google sign-in isn't configured", HttpStatus.SERVICE_UNAVAILABLE);
        }

        Map<String, Object> body;
        try {
            body = restClient.get()
                    .uri(uriBuilder -> uriBuilder.path("/tokeninfo").queryParam("id_token", idToken).build())
                    .retrieve()
                    .body(Map.class);
        } catch (Exception e) {
            throw new ApiException("Invalid Google sign-in", HttpStatus.UNAUTHORIZED);
        }

        if (body == null || !clientId.equals(body.get("aud"))) {
            throw new ApiException("Invalid Google sign-in", HttpStatus.UNAUTHORIZED);
        }
        if (!"true".equals(String.valueOf(body.get("email_verified")))) {
            throw new ApiException("Google account email is not verified", HttpStatus.UNAUTHORIZED);
        }

        String email = (String) body.get("email");
        String name = (String) body.get("name");
        if (email == null || email.isBlank()) {
            throw new ApiException("Invalid Google sign-in", HttpStatus.UNAUTHORIZED);
        }
        return new TokenInfo(email, name);
    }
}
