package com.marketplace.backend.service;

import com.marketplace.backend.exception.ApiException;
import com.marketplace.backend.model.User;
import com.marketplace.backend.repository.ProductRepository;
import com.marketplace.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class WishlistService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public WishlistService(UserRepository userRepository, ProductRepository productRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    public List<String> getWishlist(String userId) {
        return requireUser(userId).getWishlist();
    }

    public List<String> add(String userId, String productId) {
        if (!productRepository.existsById(productId)) {
            throw new ApiException("Product not found", HttpStatus.NOT_FOUND);
        }
        User user = requireUser(userId);
        if (user.getWishlist() == null) {
            user.setWishlist(new ArrayList<>());
        }
        if (!user.getWishlist().contains(productId)) {
            user.getWishlist().add(productId);
        }
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
        return user.getWishlist();
    }

    public List<String> remove(String userId, String productId) {
        User user = requireUser(userId);
        if (user.getWishlist() != null) {
            user.getWishlist().remove(productId);
        }
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
        return user.getWishlist();
    }

    private User requireUser(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
    }
}
