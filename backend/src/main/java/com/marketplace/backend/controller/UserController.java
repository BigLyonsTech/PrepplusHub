package com.marketplace.backend.controller;

import com.marketplace.backend.dto.*;
import com.marketplace.backend.security.SecurityUtils;
import com.marketplace.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/role")
    public AuthResponse confirmRole(@Valid @RequestBody RoleRequest request) {
        return userService.confirmRole(SecurityUtils.requireUserId(), request);
    }

    @PostMapping("/personalization")
    public UserResponse personalization(@RequestBody PersonalizationRequest request) {
        return userService.completePersonalization(SecurityUtils.requireUserId(), request);
    }

    @PostMapping("/vendor-eligibility")
    public UserResponse vendorEligibility(@Valid @RequestBody VendorEligibilityRequest request) {
        return userService.submitVendorEligibility(SecurityUtils.requireUserId(), request);
    }

    @PutMapping("/profile")
    public UserResponse updateProfile(@RequestBody ProfileRequest request) {
        return userService.updateProfile(SecurityUtils.requireUserId(), request);
    }
}
