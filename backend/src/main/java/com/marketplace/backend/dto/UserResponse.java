package com.marketplace.backend.dto;

import com.marketplace.backend.model.User;

import java.time.Instant;
import java.util.List;

public class UserResponse {
    private String id;
    private String name;
    private String email;
    private String role;
    private String phone;
    private String onboardingStage;
    private String registrationIntent;
    private boolean emailVerified;
    private User.PersonalizationProfile personalizationProfile;
    private User.VendorEligibility vendorEligibility;
    private String vendorVerificationStatus;
    private User.ProfileCustomization profileCustomization;
    private List<User.CartItem> cart;
    private Instant createdAt;

    public static UserResponse from(User u) {
        UserResponse r = new UserResponse();
        r.id = u.getId();
        r.name = u.getName();
        r.email = u.getEmail();
        r.role = u.getRole();
        r.phone = u.getPhone();
        r.onboardingStage = u.getOnboardingStage();
        r.registrationIntent = u.getRegistrationIntent();
        r.emailVerified = u.isEmailVerified();
        r.personalizationProfile = u.getPersonalizationProfile();
        r.vendorEligibility = u.getVendorEligibility();
        r.vendorVerificationStatus = u.getVendorVerificationStatus();
        r.profileCustomization = u.getProfileCustomization();
        r.cart = u.getCart();
        r.createdAt = u.getCreatedAt();
        return r;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String getPhone() { return phone; }
    public String getOnboardingStage() { return onboardingStage; }
    public String getRegistrationIntent() { return registrationIntent; }
    public boolean isEmailVerified() { return emailVerified; }
    public User.PersonalizationProfile getPersonalizationProfile() { return personalizationProfile; }
    public User.VendorEligibility getVendorEligibility() { return vendorEligibility; }
    public String getVendorVerificationStatus() { return vendorVerificationStatus; }
    public User.ProfileCustomization getProfileCustomization() { return profileCustomization; }
    public List<User.CartItem> getCart() { return cart; }
    public Instant getCreatedAt() { return createdAt; }
}
