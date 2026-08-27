package com.marketplace.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class GoogleAuthRequest {

    /** The ID token ("credential") returned by Google Identity Services on the frontend. */
    @NotBlank
    private String credential;

    public String getCredential() { return credential; }
    public void setCredential(String credential) { this.credential = credential; }
}
