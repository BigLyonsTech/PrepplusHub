package com.marketplace.backend.service;

import com.marketplace.backend.dto.CheckoutRequest;
import com.marketplace.backend.exception.ApiException;
import com.marketplace.backend.model.Order;
import com.marketplace.backend.model.OrderStatus;
import com.marketplace.backend.model.Product;
import com.marketplace.backend.model.User;
import com.marketplace.backend.repository.OrderRepository;
import com.marketplace.backend.repository.ProductRepository;
import com.marketplace.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
public class OrderService {

    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED_TRANSITIONS = new EnumMap<>(OrderStatus.class);
    static {
        ALLOWED_TRANSITIONS.put(OrderStatus.PROCESSING, EnumSet.of(OrderStatus.SHIPPED, OrderStatus.CANCELLED));
        ALLOWED_TRANSITIONS.put(OrderStatus.SHIPPED, EnumSet.of(OrderStatus.OUT_FOR_DELIVERY, OrderStatus.CANCELLED));
        ALLOWED_TRANSITIONS.put(OrderStatus.OUT_FOR_DELIVERY, EnumSet.of(OrderStatus.DELIVERED));
        ALLOWED_TRANSITIONS.put(OrderStatus.DELIVERED, EnumSet.noneOf(OrderStatus.class));
        ALLOWED_TRANSITIONS.put(OrderStatus.CANCELLED, EnumSet.noneOf(OrderStatus.class));
    }

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ActivityService activityService;
    private final GeocodingService geocodingService;

    public OrderService(
            OrderRepository orderRepository,
            UserRepository userRepository,
            ProductRepository productRepository,
            ActivityService activityService,
            GeocodingService geocodingService
    ) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.activityService = activityService;
        this.geocodingService = geocodingService;
    }

    public List<Order> listMine(String userId) {
        return orderRepository.findByUserIdOrderByPlacedAtDesc(userId);
    }

    public Order checkout(String userId, CheckoutRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        if (user.getCart() == null || user.getCart().isEmpty()) {
            throw new ApiException("Cart is empty", HttpStatus.BAD_REQUEST);
        }

        Order order = new Order();
        order.setUserId(userId);
        order.setStatus(OrderStatus.PROCESSING);
        order.setStatusHistory(new ArrayList<>(List.of(new Order.StatusEvent(OrderStatus.PROCESSING, Instant.now()))));
        order.setPlacedAt(Instant.now());

        Order.DeliveryAddress addr = new Order.DeliveryAddress();
        addr.setFullName(request.getFullName());
        addr.setAddress(request.getAddress());
        addr.setPhone(request.getPhone());
        geocodingService.geocode(request.getAddress()).ifPresent(latLng -> {
            addr.setLat(latLng.lat());
            addr.setLng(latLng.lng());
        });
        order.setDeliveryAddress(addr);

        List<String> productIds = user.getCart().stream().map(User.CartItem::getProductId).toList();
        Map<String, Product> productsById = StreamSupport
                .stream(productRepository.findAllById(productIds).spliterator(), false)
                .collect(Collectors.toMap(Product::getId, p -> p, (a, b) -> a, HashMap::new));

        List<Order.OrderLine> lines = new ArrayList<>();
        double total = 0;
        for (User.CartItem item : user.getCart()) {
            Product product = productsById.get(item.getProductId());
            if (product == null) {
                throw new ApiException("Product not found: " + item.getProductId(), HttpStatus.BAD_REQUEST);
            }
            Order.OrderLine line = new Order.OrderLine();
            line.setProductId(product.getId());
            line.setProductName(product.getName());
            line.setVendorId(product.getVendorId());
            line.setQuantity(item.getQuantity());
            line.setUnitPrice(product.getPrice());
            lines.add(line);
            total += product.getPrice() * item.getQuantity();
        }
        order.setItems(lines);
        order.setTotal(total);

        Order saved = orderRepository.save(order);
        user.setCart(new ArrayList<>());
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);

        activityService.log(userId, "order_placed", Map.of("orderId", saved.getId(), "total", total));
        return saved;
    }

    public Order getOrderForCustomer(String userId, String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException("Order not found", HttpStatus.NOT_FOUND));
        if (!userId.equals(order.getUserId())) {
            throw new ApiException("Not your order", HttpStatus.FORBIDDEN);
        }
        return order;
    }

    public List<Order> listForVendor(String vendorUserId) {
        return orderRepository.findByItems_VendorIdOrderByPlacedAtDesc(vendorUserId);
    }

    public Order updateStatus(String vendorUserId, String orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException("Order not found", HttpStatus.NOT_FOUND));

        boolean ownsLine = order.getItems().stream()
                .anyMatch(line -> vendorUserId.equals(line.getVendorId()));
        if (!ownsLine) {
            throw new ApiException("You don't have any items in this order", HttpStatus.FORBIDDEN);
        }

        Set<OrderStatus> allowed = ALLOWED_TRANSITIONS.getOrDefault(order.getStatus(), EnumSet.noneOf(OrderStatus.class));
        if (!allowed.contains(newStatus)) {
            throw new ApiException(
                    "Cannot move order from " + order.getStatus() + " to " + newStatus,
                    HttpStatus.BAD_REQUEST
            );
        }

        order.getStatusHistory().add(new Order.StatusEvent(newStatus, Instant.now()));
        order.setStatus(newStatus);
        Order saved = orderRepository.save(order);

        activityService.log(vendorUserId, "order_status_updated", Map.of("orderId", orderId, "status", newStatus.name()));
        return saved;
    }
}
