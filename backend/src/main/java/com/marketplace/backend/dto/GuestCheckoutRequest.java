package com.marketplace.backend.dto;

import com.marketplace.backend.model.FulfillmentType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class GuestCheckoutRequest {

    @NotBlank
    private String fullName;

    @NotBlank
    @Email
    private String email;

    // Not @NotBlank — only required for DELIVERY, validated conditionally in OrderService.
    private String address;

    @NotBlank
    private String phone;

    private FulfillmentType fulfillmentType = FulfillmentType.DELIVERY;

    @NotEmpty
    @Valid
    private List<Item> items;

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public FulfillmentType getFulfillmentType() { return fulfillmentType; }
    public void setFulfillmentType(FulfillmentType fulfillmentType) { this.fulfillmentType = fulfillmentType; }
    public List<Item> getItems() { return items; }
    public void setItems(List<Item> items) { this.items = items; }

    public static class Item {
        @NotBlank
        private String productId;

        @Min(1)
        private int quantity;

        public String getProductId() { return productId; }
        public void setProductId(String productId) { this.productId = productId; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }
}
