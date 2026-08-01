package com.marketplace.backend.service;

import com.marketplace.backend.dto.CheckoutRequest;
import com.marketplace.backend.exception.ApiException;
import com.marketplace.backend.model.Order;
import com.marketplace.backend.model.Product;
import com.marketplace.backend.model.User;
import com.marketplace.backend.repository.OrderRepository;
import com.marketplace.backend.repository.ProductRepository;
import com.marketplace.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ActivityService activityService;

    public OrderService(
            OrderRepository orderRepository,
            UserRepository userRepository,
            ProductRepository productRepository,
            ActivityService activityService
    ) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.activityService = activityService;
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
        order.setStatus("Processing");
        order.setPlacedAt(Instant.now());

        Order.DeliveryAddress addr = new Order.DeliveryAddress();
        addr.setFullName(request.getFullName());
        addr.setAddress(request.getAddress());
        addr.setPhone(request.getPhone());
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
}
