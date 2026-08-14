package com.marketplace.backend.service;

import com.marketplace.backend.dto.google.GeocodeApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Optional;

@Service
public class GeocodingService {

    private static final Logger log = LoggerFactory.getLogger(GeocodingService.class);

    public record LatLng(double lat, double lng) {}

    private final RestClient restClient;
    private final String apiKey;
    private final boolean enabled;

    public GeocodingService(@Value("${google.maps.geocoding-api-key:}") String apiKey) {
        this.apiKey = apiKey;
        this.enabled = !apiKey.isBlank();
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(4000);
        requestFactory.setReadTimeout(4000);
        this.restClient = RestClient.builder()
                .baseUrl("https://maps.googleapis.com")
                .requestFactory(requestFactory)
                .build();
    }

    public Optional<LatLng> geocode(String address) {
        if (!enabled || address == null || address.isBlank()) {
            return Optional.empty();
        }
        try {
            GeocodeApiResponse res = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/maps/api/geocode/json")
                            .queryParam("address", address)
                            .queryParam("key", apiKey)
                            .build())
                    .retrieve()
                    .body(GeocodeApiResponse.class);

            if (res == null || !"OK".equals(res.status()) || res.results() == null || res.results().isEmpty()) {
                return Optional.empty();
            }
            var location = res.results().get(0).geometry().location();
            return Optional.of(new LatLng(location.lat(), location.lng()));
        } catch (Exception e) {
            log.warn("Geocoding failed for delivery address, continuing without a map pin", e);
            return Optional.empty();
        }
    }
}
