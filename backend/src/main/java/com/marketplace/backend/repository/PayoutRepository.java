package com.marketplace.backend.repository;

import com.marketplace.backend.model.Payout;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PayoutRepository extends MongoRepository<Payout, String> {
    List<Payout> findByVendorIdOrderByCreatedAtDesc(String vendorId);
}
