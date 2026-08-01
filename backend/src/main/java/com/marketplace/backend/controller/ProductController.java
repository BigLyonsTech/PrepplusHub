package com.marketplace.backend.controller;

import com.marketplace.backend.dto.ProductRequest;
import com.marketplace.backend.model.Product;
import com.marketplace.backend.security.SecurityUtils;
import com.marketplace.backend.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<Product> list(@RequestParam(required = false) String category) {
        return productService.list(category);
    }

    @GetMapping("/{id}")
    public Product get(@PathVariable String id) {
        return productService.get(id);
    }

    @GetMapping("/vendor/{vendorId}")
    public List<Product> byVendor(@PathVariable String vendorId) {
        return productService.listByVendor(vendorId);
    }

    @PostMapping
    public Product create(@Valid @RequestBody ProductRequest request) {
        return productService.create(SecurityUtils.requireUserId(), request);
    }

    @PutMapping("/{id}")
    public Product update(@PathVariable String id, @Valid @RequestBody ProductRequest request) {
        return productService.update(SecurityUtils.requireUserId(), id, request);
    }
}
