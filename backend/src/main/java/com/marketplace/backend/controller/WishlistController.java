package com.marketplace.backend.controller;

import com.marketplace.backend.security.SecurityUtils;
import com.marketplace.backend.service.WishlistService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public List<String> get() {
        return wishlistService.getWishlist(SecurityUtils.requireUserId());
    }

    @PostMapping("/items")
    public List<String> add(@RequestBody Map<String, String> body) {
        return wishlistService.add(SecurityUtils.requireUserId(), body.get("productId"));
    }

    @DeleteMapping("/items/{productId}")
    public List<String> remove(@PathVariable String productId) {
        return wishlistService.remove(SecurityUtils.requireUserId(), productId);
    }
}
