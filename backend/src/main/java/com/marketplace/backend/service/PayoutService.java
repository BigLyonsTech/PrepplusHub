package com.marketplace.backend.service;

import com.marketplace.backend.dto.RecordPayoutRequest;
import com.marketplace.backend.exception.ApiException;
import com.marketplace.backend.model.Order;
import com.marketplace.backend.model.OrderStatus;
import com.marketplace.backend.model.Payout;
import com.marketplace.backend.model.User;
import com.marketplace.backend.repository.OrderRepository;
import com.marketplace.backend.repository.PayoutRepository;
import com.marketplace.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PayoutService {

    private final OrderRepository orderRepository;
    private final PayoutRepository payoutRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;

    public PayoutService(
            OrderRepository orderRepository,
            PayoutRepository payoutRepository,
            UserRepository userRepository,
            ActivityService activityService
    ) {
        this.orderRepository = orderRepository;
        this.payoutRepository = payoutRepository;
        this.userRepository = userRepository;
        this.activityService = activityService;
    }

    public Map<String, Object> getVendorSummary(String vendorId) {
        double earned = orderRepository.findByItems_VendorIdOrderByPlacedAtDesc(vendorId).stream()
                .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                .flatMap(o -> o.getItems().stream())
                .filter(line -> vendorId.equals(line.getVendorId()))
                .mapToDouble(line -> line.getUnitPrice() * line.getQuantity())
                .sum();

        List<Payout> payouts = payoutRepository.findByVendorIdOrderByCreatedAtDesc(vendorId);
        double paidOut = payouts.stream().mapToDouble(Payout::getAmount).sum();

        Map<String, Object> summary = new HashMap<>();
        summary.put("vendorId", vendorId);
        summary.put("earned", earned);
        summary.put("paidOut", paidOut);
        summary.put("balance", earned - paidOut);
        summary.put("payouts", payouts);
        return summary;
    }

    public List<Map<String, Object>> listForAdmin() {
        return userRepository.findByVendorVerificationStatus("verified").stream()
                .map(vendor -> {
                    Map<String, Object> summary = getVendorSummary(vendor.getId());
                    summary.put("vendorName",
                            vendor.getVendorEligibility() != null && vendor.getVendorEligibility().getBusinessName() != null
                                    ? vendor.getVendorEligibility().getBusinessName() : vendor.getName());
                    summary.put("vendorEmail", vendor.getEmail());
                    return summary;
                })
                .collect(Collectors.toList());
    }

    public Payout recordPayout(String adminId, String vendorId, RecordPayoutRequest request) {
        User vendor = userRepository.findById(vendorId)
                .orElseThrow(() -> new ApiException("Vendor not found", HttpStatus.NOT_FOUND));
        if (!"vendor".equals(vendor.getRole())) {
            throw new ApiException("User is not a vendor", HttpStatus.BAD_REQUEST);
        }

        double balance = (double) getVendorSummary(vendorId).get("balance");
        if (request.getAmount() > balance + 0.01) {
            throw new ApiException("Amount exceeds the vendor's available balance", HttpStatus.BAD_REQUEST);
        }

        Payout payout = new Payout();
        payout.setVendorId(vendorId);
        payout.setAmount(request.getAmount());
        payout.setNote(request.getNote());
        payout.setCreatedBy(adminId);
        Payout saved = payoutRepository.save(payout);

        activityService.log(adminId, "payout_recorded", Map.of(
                "vendorId", vendorId,
                "amount", request.getAmount()
        ));
        return saved;
    }
}
