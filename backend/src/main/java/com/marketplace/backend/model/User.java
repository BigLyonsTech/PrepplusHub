package com.marketplace.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String password;

    /** customer | vendor | admin — null until role confirmation */
    private String role;

    private String phone;
    private KycDetails kycDetails;

    /** kyc_pending | role_selection | personalizing | active */
    private String onboardingStage = "kyc_pending";

    /** customer | vendor | null — pre-selects role screen */
    private String registrationIntent;

    private boolean emailVerified = false;
    private String otpCode;
    private Instant otpExpiresAt;

    private PersonalizationProfile personalizationProfile;
    private VendorEligibility vendorEligibility;
    @Indexed
    private String vendorVerificationStatus; // pending | verified | rejected | null
    private ProfileCustomization profileCustomization;

    private List<CartItem> cart = new ArrayList<>();
    private List<String> wishlist = new ArrayList<>();

    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    public User() {}

    // --- nested types ---

    public static class KycDetails {
        private String idType;
        private String idNumber;
        private String dateOfBirth;
        private String address;
        private boolean agreedToTerms;

        public String getIdType() { return idType; }
        public void setIdType(String idType) { this.idType = idType; }
        public String getIdNumber() { return idNumber; }
        public void setIdNumber(String idNumber) { this.idNumber = idNumber; }
        public String getDateOfBirth() { return dateOfBirth; }
        public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public boolean isAgreedToTerms() { return agreedToTerms; }
        public void setAgreedToTerms(boolean agreedToTerms) { this.agreedToTerms = agreedToTerms; }
    }

    public static class PersonalizationProfile {
        private List<String> interests = new ArrayList<>();
        private String budgetRange;
        private String shoppingStyle;

        public List<String> getInterests() { return interests; }
        public void setInterests(List<String> interests) { this.interests = interests; }
        public String getBudgetRange() { return budgetRange; }
        public void setBudgetRange(String budgetRange) { this.budgetRange = budgetRange; }
        public String getShoppingStyle() { return shoppingStyle; }
        public void setShoppingStyle(String shoppingStyle) { this.shoppingStyle = shoppingStyle; }
    }

    public static class VendorEligibility {
        private String businessName;
        private String businessCategory;
        private String expectedProductRange;
        private List<String> documentUrls = new ArrayList<>();
        private Instant submittedAt;
        private Instant reviewedAt;
        private String reviewedBy;
        private String rejectionReason;

        public String getBusinessName() { return businessName; }
        public void setBusinessName(String businessName) { this.businessName = businessName; }
        public String getBusinessCategory() { return businessCategory; }
        public void setBusinessCategory(String businessCategory) { this.businessCategory = businessCategory; }
        public String getExpectedProductRange() { return expectedProductRange; }
        public void setExpectedProductRange(String expectedProductRange) { this.expectedProductRange = expectedProductRange; }
        public List<String> getDocumentUrls() { return documentUrls; }
        public void setDocumentUrls(List<String> documentUrls) { this.documentUrls = documentUrls; }
        public Instant getSubmittedAt() { return submittedAt; }
        public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }
        public Instant getReviewedAt() { return reviewedAt; }
        public void setReviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; }
        public String getReviewedBy() { return reviewedBy; }
        public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }
        public String getRejectionReason() { return rejectionReason; }
        public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    }

    public static class ProfileCustomization {
        private String displayName;
        private String bio;
        private String shopDescription;
        private String socialLink;
        private String accentColor;
        private String template;
        private String avatarUrl;
        private String bannerUrl;

        public String getDisplayName() { return displayName; }
        public void setDisplayName(String displayName) { this.displayName = displayName; }
        public String getBio() { return bio; }
        public void setBio(String bio) { this.bio = bio; }
        public String getShopDescription() { return shopDescription; }
        public void setShopDescription(String shopDescription) { this.shopDescription = shopDescription; }
        public String getSocialLink() { return socialLink; }
        public void setSocialLink(String socialLink) { this.socialLink = socialLink; }
        public String getAccentColor() { return accentColor; }
        public void setAccentColor(String accentColor) { this.accentColor = accentColor; }
        public String getTemplate() { return template; }
        public void setTemplate(String template) { this.template = template; }
        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
        public String getBannerUrl() { return bannerUrl; }
        public void setBannerUrl(String bannerUrl) { this.bannerUrl = bannerUrl; }
    }

    public static class CartItem {
        private String productId;
        private int quantity;

        public CartItem() {}
        public CartItem(String productId, int quantity) {
            this.productId = productId;
            this.quantity = quantity;
        }

        public String getProductId() { return productId; }
        public void setProductId(String productId) { this.productId = productId; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }

    // --- getters / setters ---

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public KycDetails getKycDetails() { return kycDetails; }
    public void setKycDetails(KycDetails kycDetails) { this.kycDetails = kycDetails; }
    public String getOnboardingStage() { return onboardingStage; }
    public void setOnboardingStage(String onboardingStage) { this.onboardingStage = onboardingStage; }
    public String getRegistrationIntent() { return registrationIntent; }
    public void setRegistrationIntent(String registrationIntent) { this.registrationIntent = registrationIntent; }
    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }
    public String getOtpCode() { return otpCode; }
    public void setOtpCode(String otpCode) { this.otpCode = otpCode; }
    public Instant getOtpExpiresAt() { return otpExpiresAt; }
    public void setOtpExpiresAt(Instant otpExpiresAt) { this.otpExpiresAt = otpExpiresAt; }
    public PersonalizationProfile getPersonalizationProfile() { return personalizationProfile; }
    public void setPersonalizationProfile(PersonalizationProfile personalizationProfile) { this.personalizationProfile = personalizationProfile; }
    public VendorEligibility getVendorEligibility() { return vendorEligibility; }
    public void setVendorEligibility(VendorEligibility vendorEligibility) { this.vendorEligibility = vendorEligibility; }
    public String getVendorVerificationStatus() { return vendorVerificationStatus; }
    public void setVendorVerificationStatus(String vendorVerificationStatus) { this.vendorVerificationStatus = vendorVerificationStatus; }
    public ProfileCustomization getProfileCustomization() { return profileCustomization; }
    public void setProfileCustomization(ProfileCustomization profileCustomization) { this.profileCustomization = profileCustomization; }
    public List<CartItem> getCart() { return cart; }
    public void setCart(List<CartItem> cart) { this.cart = cart; }
    public List<String> getWishlist() { return wishlist; }
    public void setWishlist(List<String> wishlist) { this.wishlist = wishlist; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
