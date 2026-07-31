package com.marketplace.backend.repository;

import com.marketplace.backend.model.VendorReview;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface VendorReviewRepository extends MongoRepository<VendorReview, String> {
    List<VendorReview> findByVendorIdOrderByCreatedAtDesc(String vendorId);
}
