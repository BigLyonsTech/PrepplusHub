package com.marketplace.backend.service;

import com.marketplace.backend.dto.RejectRequest;
import com.marketplace.backend.exception.ApiException;
import com.marketplace.backend.model.ActivityLog;
import com.marketplace.backend.model.PlatformSettings;
import com.marketplace.backend.model.Product;
import com.marketplace.backend.model.User;
import com.marketplace.backend.repository.ActivityLogRepository;
import com.marketplace.backend.repository.PlatformSettingsRepository;
import com.marketplace.backend.repository.ProductRepository;
import com.marketplace.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;
    private final PlatformSettingsRepository platformSettingsRepository;
    private final ProductRepository productRepository;
    private final ActivityService activityService;

    public AdminService(
            UserRepository userRepository,
            ActivityLogRepository activityLogRepository,
            PlatformSettingsRepository platformSettingsRepository,
            ProductRepository productRepository,
            ActivityService activityService
    ) {
        this.userRepository = userRepository;
        this.activityLogRepository = activityLogRepository;
        this.platformSettingsRepository = platformSettingsRepository;
        this.productRepository = productRepository;
        this.activityService = activityService;
    }

    public Map<String, Object> dashboard() {
        List<Map<String, Object>> vendorQueue = userRepository.findByVendorVerificationStatus("pending")
                .stream()
                .map(this::vendorQueueItem)
                .collect(Collectors.toList());

        List<Map<String, Object>> approvedVendors = userRepository.findByVendorVerificationStatus("verified")
                .stream()
                .map(this::vendorQueueItem)
                .collect(Collectors.toList());

        // Customer KYC queue — reserved for future flags; empty for now
        List<Map<String, Object>> customerQueue = List.of();

        List<ActivityLog> activityLog = activityLogRepository.findTop100ByOrderByCreatedAtDesc();
        PlatformSettings settings = getOrCreateSettings();

        Map<String, Object> result = new HashMap<>();
        result.put("vendorQueue", vendorQueue);
        result.put("approvedVendors", approvedVendors);
        result.put("customerQueue", customerQueue);
        result.put("activityLog", activityLog);
        result.put("dashboardCuration", Map.of(
                "featuredCategories", settings.getFeaturedCategories(),
                "banners", settings.getBanners()
        ));
        return result;
    }

    public User approveVendor(String adminId, String vendorUserId) {
        User vendor = requireVendor(vendorUserId);
        vendor.setVendorVerificationStatus("verified");
        if (vendor.getVendorEligibility() != null) {
            vendor.getVendorEligibility().setReviewedAt(Instant.now());
            vendor.getVendorEligibility().setReviewedBy(adminId);
            vendor.getVendorEligibility().setRejectionReason(null);
        }
        vendor.setUpdatedAt(Instant.now());
        userRepository.save(vendor);
        activityService.log(adminId, "vendor_approved", Map.of("vendorId", vendorUserId));
        return vendor;
    }

    public User rejectVendor(String adminId, String vendorUserId, RejectRequest request) {
        User vendor = requireVendor(vendorUserId);
        vendor.setVendorVerificationStatus("rejected");
        if (vendor.getVendorEligibility() != null) {
            vendor.getVendorEligibility().setReviewedAt(Instant.now());
            vendor.getVendorEligibility().setReviewedBy(adminId);
            vendor.getVendorEligibility().setRejectionReason(request.getReason());
        }
        vendor.setUpdatedAt(Instant.now());
        userRepository.save(vendor);
        activityService.log(adminId, "vendor_rejected", Map.of("vendorId", vendorUserId, "reason", request.getReason()));
        return vendor;
    }

    public Product setProductActive(String productId, boolean active) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));
        product.setActive(active);
        return productRepository.save(product);
    }

    public PlatformSettings toggleFeaturedCategory(String category) {
        PlatformSettings settings = getOrCreateSettings();
        List<String> list = settings.getFeaturedCategories();
        if (list.contains(category)) {
            list.remove(category);
        } else {
            list.add(category);
        }
        settings.setFeaturedCategories(list);
        return platformSettingsRepository.save(settings);
    }

    private User requireVendor(String vendorUserId) {
        User vendor = userRepository.findById(vendorUserId)
                .orElseThrow(() -> new ApiException("Vendor not found", HttpStatus.NOT_FOUND));
        if (!"vendor".equals(vendor.getRole())) {
            throw new ApiException("User is not a vendor", HttpStatus.BAD_REQUEST);
        }
        return vendor;
    }

    private Map<String, Object> vendorQueueItem(User v) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", v.getId());
        m.put("name", v.getName());
        m.put("email", v.getEmail());
        m.put("status", v.getVendorVerificationStatus());
        if (v.getVendorEligibility() != null) {
            m.put("businessName", v.getVendorEligibility().getBusinessName());
            m.put("businessCategory", v.getVendorEligibility().getBusinessCategory());
            m.put("expectedProductRange", v.getVendorEligibility().getExpectedProductRange());
            m.put("documentUrls", v.getVendorEligibility().getDocumentUrls());
            m.put("submittedAt", v.getVendorEligibility().getSubmittedAt());
            m.put("rejectionReason", v.getVendorEligibility().getRejectionReason());
        }
        return m;
    }

    private PlatformSettings getOrCreateSettings() {
        return platformSettingsRepository.findById(PlatformSettings.SINGLETON_ID)
                .orElseGet(() -> {
                    PlatformSettings s = new PlatformSettings();
                    s.setFeaturedCategories(List.of("Electronics", "Fashion", "Home"));
                    PlatformSettings.Banner b = new PlatformSettings.Banner();
                    b.setId("b-1");
                    b.setTitle("Mid-year sale");
                    b.setActive(true);
                    s.setBanners(List.of(b));
                    return platformSettingsRepository.save(s);
                });
    }
}
