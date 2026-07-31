package com.marketplace.backend.service;

import com.marketplace.backend.dto.ReviewRequest;
import com.marketplace.backend.exception.ApiException;
import com.marketplace.backend.model.Product;
import com.marketplace.backend.model.ProductReview;
import com.marketplace.backend.model.User;
import com.marketplace.backend.model.VendorReview;
import com.marketplace.backend.repository.ProductRepository;
import com.marketplace.backend.repository.ProductReviewRepository;
import com.marketplace.backend.repository.UserRepository;
import com.marketplace.backend.repository.VendorReviewRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class ReviewService {

    private final ProductReviewRepository productReviewRepository;
    private final VendorReviewRepository vendorReviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ReviewService(
            ProductReviewRepository productReviewRepository,
            VendorReviewRepository vendorReviewRepository,
            ProductRepository productRepository,
            UserRepository userRepository
    ) {
        this.productReviewRepository = productReviewRepository;
        this.vendorReviewRepository = vendorReviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public List<ProductReview> productReviews(String productId) {
        return productReviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    public List<VendorReview> vendorReviews(String vendorId) {
        return vendorReviewRepository.findByVendorIdOrderByCreatedAtDesc(vendorId);
    }

    public ProductReview addProductReview(String userId, String productId, ReviewRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        ProductReview review = new ProductReview();
        review.setProductId(productId);
        review.setUserId(userId);
        review.setAuthor(user.getName());
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setCreatedAt(Instant.now());
        ProductReview saved = productReviewRepository.save(review);

        // Refresh aggregate rating
        List<ProductReview> all = productReviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
        double avg = all.stream().mapToInt(ProductReview::getRating).average().orElse(0);
        product.setRating(Math.round(avg * 10.0) / 10.0);
        product.setReviewCount(all.size());
        productRepository.save(product);

        return saved;
    }

    public VendorReview addVendorReview(String userId, String vendorId, ReviewRequest request) {
        if (!userRepository.existsById(vendorId)) {
            throw new ApiException("Vendor not found", HttpStatus.NOT_FOUND);
        }
        VendorReview review = new VendorReview();
        review.setVendorId(vendorId);
        review.setCustomerId(userId);
        review.setOrderId(request.getOrderId() != null ? request.getOrderId() : "n/a");
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setCreatedAt(Instant.now());
        return vendorReviewRepository.save(review);
    }
}
