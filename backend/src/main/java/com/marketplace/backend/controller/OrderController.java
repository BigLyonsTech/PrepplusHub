package com.marketplace.backend.controller;

import com.marketplace.backend.dto.AvailabilityRequest;
import com.marketplace.backend.dto.CheckoutRequest;
import com.marketplace.backend.dto.GuestCheckoutRequest;
import com.marketplace.backend.dto.UpdateOrderStatusRequest;
import com.marketplace.backend.model.Order;
import com.marketplace.backend.security.SecurityUtils;
import com.marketplace.backend.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    @GetMapping("/{id}")
    public Order get(@PathVariable String id) {
        return orderService.getOrderForCustomer(SecurityUtils.requireUserId(), id);
    }

    @GetMapping("/vendor/mine")
    public List<Order> vendorOrders() {
        return orderService.listForVendor(SecurityUtils.requireUserId());
    }

    @PostMapping("/checkout")
    public Order checkout(@Valid @RequestBody CheckoutRequest request) {
        return orderService.checkout(SecurityUtils.requireUserId(), request);
    }

    @PostMapping("/check-availability")
    public Map<String, Boolean> checkAvailability(@Valid @RequestBody AvailabilityRequest request) {
        orderService.checkAvailability(request.getItems());
        return Map.of("available", true);
    }

    @PostMapping("/guest-checkout")
    public Order guestCheckout(@Valid @RequestBody GuestCheckoutRequest request) {
        return orderService.guestCheckout(request);
    }

    @PatchMapping("/{id}/status")
    public Order updateStatus(@PathVariable String id, @Valid @RequestBody UpdateOrderStatusRequest request) {
        return orderService.updateStatus(SecurityUtils.requireUserId(), id, request.getStatus());
    }
}
