package com.marketplace.backend.service;

import com.marketplace.backend.dto.*;
import com.marketplace.backend.exception.ApiException;
import com.marketplace.backend.model.User;
import com.marketplace.backend.repository.UserRepository;
import com.marketplace.backend.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final ActivityService activityService;

    public UserService(UserRepository userRepository, JwtService jwtService, ActivityService activityService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.activityService = activityService;
    }

    public AuthResponse confirmRole(String userId, RoleRequest request) {
        User user = requireUser(userId);
        if (!user.isEmailVerified()) {
            throw new ApiException("Verify your email first", HttpStatus.BAD_REQUEST);
        }
        user.setRole(request.getRole());
        user.setOnboardingStage("personalizing");
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
        activityService.log(userId, "role_confirmed", java.util.Map.of("role", request.getRole()));

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());
        return AuthResponse.token(token, UserResponse.from(user));
    }

    public UserResponse completePersonalization(String userId, PersonalizationRequest request) {
        User user = requireUser(userId);
        User.PersonalizationProfile profile = new User.PersonalizationProfile();
        profile.setInterests(request.getInterests() != null ? request.getInterests() : List.of());
        profile.setBudgetRange(request.getBudgetRange());
        profile.setShoppingStyle(request.getShoppingStyle());
        user.setPersonalizationProfile(profile);
        user.setOnboardingStage("active");
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
        activityService.log(userId, "personalization_completed");
        return UserResponse.from(user);
    }

    public UserResponse submitVendorEligibility(String userId, VendorEligibilityRequest request) {
        User user = requireUser(userId);
        if (!"vendor".equals(user.getRole())) {
            throw new ApiException("Only vendors can submit eligibility", HttpStatus.FORBIDDEN);
        }

        User.VendorEligibility el = new User.VendorEligibility();
        el.setBusinessName(request.getBusinessName());
        el.setBusinessCategory(request.getBusinessCategory());
        el.setExpectedProductRange(request.getExpectedProductRange());
        el.setDocumentUrls(request.getDocumentUrls() != null ? request.getDocumentUrls() : new ArrayList<>());
        el.setSubmittedAt(Instant.now());
        user.setVendorEligibility(el);
        user.setVendorVerificationStatus("pending");
        user.setOnboardingStage("active");
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
        activityService.log(userId, "vendor_eligibility_submitted");
        return UserResponse.from(user);
    }

    public UserResponse updateProfile(String userId, ProfileRequest request) {
        User user = requireUser(userId);
        User.ProfileCustomization pc = user.getProfileCustomization();
        if (pc == null) {
            pc = new User.ProfileCustomization();
        }
        if (request.getDisplayName() != null) pc.setDisplayName(request.getDisplayName());
        if (request.getBio() != null) pc.setBio(request.getBio());
        if (request.getShopDescription() != null) pc.setShopDescription(request.getShopDescription());
        if (request.getSocialLink() != null) pc.setSocialLink(request.getSocialLink());
        if (request.getAccentColor() != null) pc.setAccentColor(request.getAccentColor());
        if (request.getTemplate() != null) pc.setTemplate(request.getTemplate());
        if (request.getAvatarUrl() != null) pc.setAvatarUrl(request.getAvatarUrl());
        if (request.getBannerUrl() != null) pc.setBannerUrl(request.getBannerUrl());
        user.setProfileCustomization(pc);
        if (request.getDisplayName() != null && !request.getDisplayName().isBlank()) {
            user.setName(request.getDisplayName());
        }
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
        return UserResponse.from(user);
    }

    private User requireUser(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
    }
}
