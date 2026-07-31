package com.marketplace.backend.service;

import com.marketplace.backend.dto.ProductRequest;
import com.marketplace.backend.exception.ApiException;
import com.marketplace.backend.model.Product;
import com.marketplace.backend.model.User;
import com.marketplace.backend.repository.ProductRepository;
import com.marketplace.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;

    public ProductService(
            ProductRepository productRepository,
            UserRepository userRepository,
            ActivityService activityService
    ) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.activityService = activityService;
    }

    public List<Product> list(String category) {
        if (category != null && !category.isBlank()) {
            return productRepository.findByCategoryIgnoreCaseAndActiveTrue(category.trim());
        }
        return productRepository.findByActiveTrue();
    }

    public Product get(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));
    }

    public List<Product> listByVendor(String vendorId) {
        return productRepository.findByVendorIdAndActiveTrue(vendorId);
    }

    public Product create(String vendorUserId, ProductRequest request) {
        User vendor = userRepository.findById(vendorUserId)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        if (!"vendor".equals(vendor.getRole())) {
            throw new ApiException("Only vendors can list products", HttpStatus.FORBIDDEN);
        }
        if (!"verified".equals(vendor.getVendorVerificationStatus())) {
            throw new ApiException("Vendor not verified yet", HttpStatus.FORBIDDEN);
        }

        Product p = new Product();
        p.setName(request.getName());
        p.setPrice(request.getPrice());
        p.setOriginalPrice(request.getOriginalPrice());
        p.setCategory(request.getCategory());
        p.setDescription(request.getDescription());
        p.setImage(request.getImage());
        p.setVendorId(vendor.getId());
        String shopName = vendor.getVendorEligibility() != null
                ? vendor.getVendorEligibility().getBusinessName()
                : vendor.getName();
        p.setVendor(shopName);
        p.setActive(true);
        p.setCreatedAt(Instant.now());
        Product saved = productRepository.save(p);
        activityService.log(vendorUserId, "product_listed", java.util.Map.of("productId", saved.getId()));
        return saved;
    }
}
