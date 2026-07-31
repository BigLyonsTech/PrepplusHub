package com.marketplace.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class RoleRequest {

    @NotBlank
    @Pattern(regexp = "customer|vendor")
    private String role;

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
