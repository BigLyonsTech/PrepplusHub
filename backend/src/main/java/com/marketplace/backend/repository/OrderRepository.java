package com.marketplace.backend.repository;

import com.marketplace.backend.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findByUserIdOrderByPlacedAtDesc(String userId);
    List<Order> findByItems_VendorIdOrderByPlacedAtDesc(String vendorId);
}
