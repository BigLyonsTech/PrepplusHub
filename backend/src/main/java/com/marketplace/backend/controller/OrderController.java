package com.marketplace.backend.controller;

import com.marketplace.backend.dto.CheckoutRequest;
import com.marketplace.backend.model.Order;
import com.marketplace.backend.security.SecurityUtils;
import com.marketplace.backend.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public List<Order> mine() {
        return orderService.listMine(SecurityUtils.requireUserId());
    }

    @PostMapping("/checkout")
    public Order checkout(@Valid @RequestBody CheckoutRequest request) {
        return orderService.checkout(SecurityUtils.requireUserId(), request);
    }
}
