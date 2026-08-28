package com.marketplace.backend.dto;

import com.marketplace.backend.model.FulfillmentType;
import jakarta.validation.constraints.NotBlank;

public class CheckoutRequest {

    @NotBlank
    private String fullName;

    // Not @NotBlank — only required for DELIVERY, validated conditionally in OrderService.
    private String address;

    @NotBlank
    private String phone;

    private FulfillmentType fulfillmentType = FulfillmentType.DELIVERY;

    @NotBlank
    private String paymentReference;

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public FulfillmentType getFulfillmentType() { return fulfillmentType; }
    public void setFulfillmentType(FulfillmentType fulfillmentType) { this.fulfillmentType = fulfillmentType; }
    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }
}
