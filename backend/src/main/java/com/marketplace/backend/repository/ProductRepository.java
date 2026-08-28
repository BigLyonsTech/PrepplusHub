package com.marketplace.backend.repository;

import com.marketplace.backend.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findByActiveTrue();
    List<Product> findByCategoryIgnoreCaseAndActiveTrue(String category);
    List<Product> findByVendorIdAndActiveTrue(String vendorId);
    List<Product> findByVendorId(String vendorId);
}
