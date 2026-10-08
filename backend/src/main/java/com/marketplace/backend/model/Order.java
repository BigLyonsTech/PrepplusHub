package com.marketplace.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "orders")
@CompoundIndex(name = "userId_placedAt_idx", def = "{'userId': 1, 'placedAt': -1}")
public class Order {

    @Id
    private String id;

    /** Null for a guest order — see guestEmail in that case. */
    private String userId;
    private String guestEmail;
    private String paymentReference;
    // Unguessable secret that lets a guest (no account) view their order from
    // the emailed link. Never shown in vendor/admin listings' UI.
    private String trackingToken;
    private List<OrderLine> items = new ArrayList<>();
    private double subtotal;
    private double shippingFee;
    private double total;
    private OrderStatus status;
    private List<StatusEvent> statusHistory = new ArrayList<>();
    private FulfillmentType fulfillmentType = FulfillmentType.DELIVERY;
    private DeliveryAddress deliveryAddress;
    private Instant placedAt = Instant.now();

    public static class OrderLine {
        private String productId;
        private String productName;
        private String vendorId;
        private int quantity;
        private double unitPrice;
        // True when this line's quantity was taken out of the product's tracked
        // stock, so a cancellation knows exactly what to put back.
        private boolean stockReserved;

        public String getProductId() { return productId; }
        public void setProductId(String productId) { this.productId = productId; }
        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }
        public String getVendorId() { return vendorId; }
        public void setVendorId(String vendorId) { this.vendorId = vendorId; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
        public double getUnitPrice() { return unitPrice; }
        public void setUnitPrice(double unitPrice) { this.unitPrice = unitPrice; }
        public boolean isStockReserved() { return stockReserved; }
        public void setStockReserved(boolean stockReserved) { this.stockReserved = stockReserved; }
    }

    public static class DeliveryAddress {
        private String fullName;
        private String address;
        private String phone;
        private Double lat;
        private Double lng;

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public Double getLat() { return lat; }
        public void setLat(Double lat) { this.lat = lat; }
        public Double getLng() { return lng; }
        public void setLng(Double lng) { this.lng = lng; }
    }

    public static class StatusEvent {
        private OrderStatus status;
        private Instant at;

        public StatusEvent() {}

        public StatusEvent(OrderStatus status, Instant at) {
            this.status = status;
            this.at = at;
        }

        public OrderStatus getStatus() { return status; }
        public void setStatus(OrderStatus status) { this.status = status; }
        public Instant getAt() { return at; }
        public void setAt(Instant at) { this.at = at; }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getGuestEmail() { return guestEmail; }
    public void setGuestEmail(String guestEmail) { this.guestEmail = guestEmail; }
    public String getTrackingToken() { return trackingToken; }
    public void setTrackingToken(String trackingToken) { this.trackingToken = trackingToken; }
    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }
    public List<OrderLine> getItems() { return items; }
    public void setItems(List<OrderLine> items) { this.items = items; }
    public double getSubtotal() { return subtotal; }
    public void setSubtotal(double subtotal) { this.subtotal = subtotal; }
    public double getShippingFee() { return shippingFee; }
    public void setShippingFee(double shippingFee) { this.shippingFee = shippingFee; }
    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }
    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }
    public List<StatusEvent> getStatusHistory() { return statusHistory; }
    public void setStatusHistory(List<StatusEvent> statusHistory) { this.statusHistory = statusHistory; }
    public FulfillmentType getFulfillmentType() { return fulfillmentType; }
    public void setFulfillmentType(FulfillmentType fulfillmentType) { this.fulfillmentType = fulfillmentType; }
    public DeliveryAddress getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(DeliveryAddress deliveryAddress) { this.deliveryAddress = deliveryAddress; }
    public Instant getPlacedAt() { return placedAt; }
    public void setPlacedAt(Instant placedAt) { this.placedAt = placedAt; }
}
