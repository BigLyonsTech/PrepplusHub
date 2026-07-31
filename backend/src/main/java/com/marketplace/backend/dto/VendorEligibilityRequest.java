package com.marketplace.backend.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public class VendorEligibilityRequest {

    @NotBlank
    private String businessName;

    @NotBlank
    private String businessCategory;

    @NotBlank
    private String expectedProductRange;

    private List<String> documentUrls;

    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }
    public String getBusinessCategory() { return businessCategory; }
    public void setBusinessCategory(String businessCategory) { this.businessCategory = businessCategory; }
    public String getExpectedProductRange() { return expectedProductRange; }
    public void setExpectedProductRange(String expectedProductRange) { this.expectedProductRange = expectedProductRange; }
    public List<String> getDocumentUrls() { return documentUrls; }
    public void setDocumentUrls(List<String> documentUrls) { this.documentUrls = documentUrls; }
}
