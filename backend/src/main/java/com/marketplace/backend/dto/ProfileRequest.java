package com.marketplace.backend.dto;

public class ProfileRequest {
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
