package com.marketplace.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank
    private String name;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 8)
    private String password;

    @NotBlank
    private String phone;

    @NotBlank
    private String idType;

    @NotBlank
    private String idNumber;

    @NotBlank
    private String dob;

    @NotBlank
    private String address;

    private boolean agreedToTerms;
    private String registrationIntent; // customer | vendor | null

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getIdType() { return idType; }
    public void setIdType(String idType) { this.idType = idType; }
    public String getIdNumber() { return idNumber; }
    public void setIdNumber(String idNumber) { this.idNumber = idNumber; }
    public String getDob() { return dob; }
    public void setDob(String dob) { this.dob = dob; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public boolean isAgreedToTerms() { return agreedToTerms; }
    public void setAgreedToTerms(boolean agreedToTerms) { this.agreedToTerms = agreedToTerms; }
    public String getRegistrationIntent() { return registrationIntent; }
    public void setRegistrationIntent(String registrationIntent) { this.registrationIntent = registrationIntent; }
}
