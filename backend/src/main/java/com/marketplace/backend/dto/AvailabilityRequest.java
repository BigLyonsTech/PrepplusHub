package com.marketplace.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class AvailabilityRequest {

    @NotEmpty
    @Valid
    private List<GuestCheckoutRequest.Item> items;

    public List<GuestCheckoutRequest.Item> getItems() { return items; }
    public void setItems(List<GuestCheckoutRequest.Item> items) { this.items = items; }
}
