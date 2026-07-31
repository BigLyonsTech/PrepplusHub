package com.marketplace.backend.repository;

import com.marketplace.backend.model.ProductReview;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ProductReviewRepository extends MongoRepository<ProductReview, String> {
    List<ProductReview> findByProductIdOrderByCreatedAtDesc(String productId);
}
