package com.marketplace.backend.controller;

import com.marketplace.backend.model.User;
import com.marketplace.backend.security.SecurityUtils;
import com.marketplace.backend.service.CartService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public List<User.CartItem> get() {
        return cartService.getCart(SecurityUtils.requireUserId());
    }

    @PostMapping("/items")
    public List<User.CartItem> add(@RequestBody Map<String, String> body) {
        return cartService.add(SecurityUtils.requireUserId(), body.get("productId"));
    }

    @PutMapping("/items/{productId}")
    public List<User.CartItem> setQuantity(@PathVariable String productId, @RequestBody Map<String, Integer> body) {
        Integer quantity = body.get("quantity");
        return cartService.setQuantity(SecurityUtils.requireUserId(), productId, quantity == null ? 0 : quantity);
    }

    @DeleteMapping("/items/{productId}")
    public List<User.CartItem> remove(@PathVariable String productId) {
        return cartService.remove(SecurityUtils.requireUserId(), productId);
    }

    @DeleteMapping
    public List<User.CartItem> clear() {
        return cartService.clear(SecurityUtils.requireUserId());
    }
}
