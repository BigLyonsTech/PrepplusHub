package com.marketplace.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class CheckoutRequest {

    @NotBlank
    private String fullName;

    @NotBlank
    private String address;

    @NotBlank
    private String phone;

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}
