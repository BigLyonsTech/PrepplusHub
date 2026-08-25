package com.marketplace.backend.service;

import com.marketplace.backend.dto.CheckoutRequest;
import com.marketplace.backend.dto.GuestCheckoutRequest;
import com.marketplace.backend.exception.ApiException;
import com.marketplace.backend.model.FulfillmentType;
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

    private static final String STORE_PICKUP_ADDRESS =
            "23 Bisiriyu Lawal St, Shasha, Lagos 100275, Lagos Nigeria";

    // Packaging (nylon, etc.) is a real per-order cost and is never waived —
    // it's folded into the customer-facing "Shipping" total rather than shown
    // as its own line. The delivery portion is waived at/above the free-
    // shipping threshold and isn't charged at all for in-store pickup.
    private static final double PACKAGING_FEE = 500;
    private static final double DELIVERY_FEE = 2500;
    private static final double FREE_DELIVERY_THRESHOLD = 50000;

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
    private final EmailService emailService;

    public OrderService(
            OrderRepository orderRepository,
            UserRepository userRepository,
            ProductRepository productRepository,
            ActivityService activityService,
            GeocodingService geocodingService,
            EmailService emailService
    ) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.activityService = activityService;
        this.geocodingService = geocodingService;
        this.emailService = emailService;
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

        List<CartLine> lines = user.getCart().stream()
                .map(item -> new CartLine(item.getProductId(), item.getQuantity()))
                .toList();

        Order order = buildOrder(
                request.getFullName(), request.getPhone(), request.getFulfillmentType(), request.getAddress(), lines
        );
        order.setUserId(userId);

        Order saved = orderRepository.save(order);
        user.setCart(new ArrayList<>());
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);

        activityService.log(userId, "order_placed", Map.of("orderId", saved.getId(), "total", saved.getTotal()));
        emailService.notifyAdminNewOrder(saved.getId(), saved.getTotal(), user.getName() + " (" + user.getEmail() + ")");
        emailService.sendOrderConfirmation(user.getEmail(), saved.getId(), saved.getTotal());
        return saved;
    }

    public Order guestCheckout(GuestCheckoutRequest request) {
        List<CartLine> lines = request.getItems().stream()
                .map(item -> new CartLine(item.getProductId(), item.getQuantity()))
                .toList();

        Order order = buildOrder(
                request.getFullName(), request.getPhone(), request.getFulfillmentType(), request.getAddress(), lines
        );
        order.setGuestEmail(request.getEmail());

        Order saved = orderRepository.save(order);

        activityService.log("guest:" + request.getEmail(), "order_placed", Map.of("orderId", saved.getId(), "total", saved.getTotal()));
        emailService.notifyAdminNewOrder(saved.getId(), saved.getTotal(), request.getFullName() + " (guest, " + request.getEmail() + ")");
        emailService.sendOrderConfirmation(request.getEmail(), saved.getId(), saved.getTotal());
        return saved;
    }

    private record CartLine(String productId, int quantity) {}

    /** Builds and prices an order from resolved cart lines. Caller still needs to set userId or guestEmail. */
    private Order buildOrder(
            String fullName, String phone, FulfillmentType requestedFulfillmentType, String rawAddress, List<CartLine> cartLines
    ) {
        if (cartLines.isEmpty()) {
            throw new ApiException("Cart is empty", HttpStatus.BAD_REQUEST);
        }

        FulfillmentType fulfillmentType = requestedFulfillmentType != null
                ? requestedFulfillmentType : FulfillmentType.DELIVERY;

        String resolvedAddress;
        if (fulfillmentType == FulfillmentType.PICKUP) {
            resolvedAddress = STORE_PICKUP_ADDRESS;
        } else {
            if (rawAddress == null || rawAddress.isBlank()) {
                throw new ApiException("Address is required for delivery", HttpStatus.BAD_REQUEST);
            }
            resolvedAddress = rawAddress;
        }

        Order order = new Order();
        order.setStatus(OrderStatus.PROCESSING);
        order.setStatusHistory(new ArrayList<>(List.of(new Order.StatusEvent(OrderStatus.PROCESSING, Instant.now()))));
        order.setFulfillmentType(fulfillmentType);
        order.setPlacedAt(Instant.now());

        Order.DeliveryAddress addr = new Order.DeliveryAddress();
        addr.setFullName(fullName);
        addr.setAddress(resolvedAddress);
        addr.setPhone(phone);
        geocodingService.geocode(resolvedAddress).ifPresent(latLng -> {
            addr.setLat(latLng.lat());
            addr.setLng(latLng.lng());
        });
        order.setDeliveryAddress(addr);

        List<String> productIds = cartLines.stream().map(CartLine::productId).toList();
        Map<String, Product> productsById = StreamSupport
                .stream(productRepository.findAllById(productIds).spliterator(), false)
                .collect(Collectors.toMap(Product::getId, p -> p, (a, b) -> a, HashMap::new));

        List<Order.OrderLine> lines = new ArrayList<>();
        double subtotal = 0;
        for (CartLine item : cartLines) {
            Product product = productsById.get(item.productId());
            if (product == null) {
                throw new ApiException("Product not found: " + item.productId(), HttpStatus.BAD_REQUEST);
            }
            Order.OrderLine line = new Order.OrderLine();
            line.setProductId(product.getId());
            line.setProductName(product.getName());
            line.setVendorId(product.getVendorId());
            line.setQuantity(item.quantity());
            line.setUnitPrice(product.getPrice());
            lines.add(line);
            subtotal += product.getPrice() * item.quantity();
        }

        double deliveryFee = fulfillmentType == FulfillmentType.PICKUP || subtotal >= FREE_DELIVERY_THRESHOLD
                ? 0 : DELIVERY_FEE;
        double shippingFee = deliveryFee + PACKAGING_FEE;

        order.setItems(lines);
        order.setSubtotal(subtotal);
        order.setShippingFee(shippingFee);
        order.setTotal(subtotal + shippingFee);
        return order;
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
