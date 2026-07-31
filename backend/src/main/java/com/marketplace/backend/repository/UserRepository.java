package com.marketplace.backend.repository;

import com.marketplace.backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByVendorVerificationStatus(String status);
    List<User> findByRole(String role);
}
