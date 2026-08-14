package com.marketplace.backend.dto.google;

import java.util.List;

public record GeocodeApiResponse(String status, List<Result> results) {
    public record Result(Geometry geometry) {}
    public record Geometry(Location location) {}
    public record Location(double lat, double lng) {}
}
