package com.marketplace.backend.controller;

import com.marketplace.backend.dto.ReviewRequest;
import com.marketplace.backend.model.ProductReview;
import com.marketplace.backend.model.VendorReview;
import com.marketplace.backend.security.SecurityUtils;
import com.marketplace.backend.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/products/{productId}")
    public List<ProductReview> productReviews(@PathVariable String productId) {
        return reviewService.productReviews(productId);
    }

    @GetMapping("/vendors/{vendorId}")
    public List<VendorReview> vendorReviews(@PathVariable String vendorId) {
        return reviewService.vendorReviews(vendorId);
    }

    @PostMapping("/products/{productId}")
    public ProductReview addProductReview(
            @PathVariable String productId,
            @Valid @RequestBody ReviewRequest request
    ) {
        return reviewService.addProductReview(SecurityUtils.requireUserId(), productId, request);
    }

    @PostMapping("/vendors/{vendorId}")
    public VendorReview addVendorReview(
            @PathVariable String vendorId,
            @Valid @RequestBody ReviewRequest request
    ) {
        return reviewService.addVendorReview(SecurityUtils.requireUserId(), vendorId, request);
    }
}
