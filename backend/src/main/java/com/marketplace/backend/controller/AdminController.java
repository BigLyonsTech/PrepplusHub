package com.marketplace.backend.controller;

import com.marketplace.backend.dto.RejectRequest;
import com.marketplace.backend.dto.UserResponse;
import com.marketplace.backend.model.PlatformSettings;
import com.marketplace.backend.model.Product;
import com.marketplace.backend.model.User;
import com.marketplace.backend.security.SecurityUtils;
import com.marketplace.backend.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard() {
        return adminService.dashboard();
    }

    @PostMapping("/vendors/{vendorId}/approve")
    public UserResponse approve(@PathVariable String vendorId) {
        User user = adminService.approveVendor(SecurityUtils.requireUserId(), vendorId);
        return UserResponse.from(user);
    }

    @PostMapping("/vendors/{vendorId}/reject")
    public UserResponse reject(@PathVariable String vendorId, @Valid @RequestBody RejectRequest request) {
        User user = adminService.rejectVendor(SecurityUtils.requireUserId(), vendorId, request);
        return UserResponse.from(user);
    }

    @PostMapping("/featured-categories/{category}/toggle")
    public PlatformSettings toggleCategory(@PathVariable String category) {
        return adminService.toggleFeaturedCategory(category);
    }

    @PostMapping("/products/{id}/deactivate")
    public Product deactivateProduct(@PathVariable String id) {
        return adminService.setProductActive(id, false);
    }

    @PostMapping("/products/{id}/activate")
    public Product activateProduct(@PathVariable String id) {
        return adminService.setProductActive(id, true);
    }
}
