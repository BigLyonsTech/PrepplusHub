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
public class CartService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public CartService(UserRepository userRepository, ProductRepository productRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    public List<User.CartItem> getCart(String userId) {
        return requireUser(userId).getCart();
    }

    public List<User.CartItem> add(String userId, String productId) {
        if (!productRepository.existsById(productId)) {
            throw new ApiException("Product not found", HttpStatus.NOT_FOUND);
        }
        User user = requireUser(userId);
        if (user.getCart() == null) {
            user.setCart(new ArrayList<>());
        }
        User.CartItem existing = user.getCart().stream()
                .filter(c -> c.getProductId().equals(productId))
                .findFirst()
                .orElse(null);
        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + 1);
        } else {
            user.getCart().add(new User.CartItem(productId, 1));
        }
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
        return user.getCart();
    }

    public List<User.CartItem> setQuantity(String userId, String productId, int quantity) {
        if (quantity <= 0) {
            return remove(userId, productId);
        }
        if (!productRepository.existsById(productId)) {
            throw new ApiException("Product not found", HttpStatus.NOT_FOUND);
        }
        User user = requireUser(userId);
        if (user.getCart() == null) {
            user.setCart(new ArrayList<>());
        }
        User.CartItem existing = user.getCart().stream()
                .filter(c -> c.getProductId().equals(productId))
                .findFirst()
                .orElse(null);
        if (existing != null) {
            existing.setQuantity(quantity);
        } else {
            user.getCart().add(new User.CartItem(productId, quantity));
        }
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
        return user.getCart();
    }

    public List<User.CartItem> remove(String userId, String productId) {
        User user = requireUser(userId);
        if (user.getCart() != null) {
            user.getCart().removeIf(c -> c.getProductId().equals(productId));
        }
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
        return user.getCart();
    }

    public List<User.CartItem> clear(String userId) {
        User user = requireUser(userId);
        user.setCart(new ArrayList<>());
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
        return user.getCart();
    }

    private User requireUser(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
    }
}
