package com.marketplace.backend.controller;

import com.marketplace.backend.security.SecurityUtils;
import com.marketplace.backend.service.PayoutService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/vendor/payouts")
public class VendorPayoutController {

    private final PayoutService payoutService;

    public VendorPayoutController(PayoutService payoutService) {
        this.payoutService = payoutService;
    }

    @GetMapping
    public Map<String, Object> mine() {
        return payoutService.getVendorSummary(SecurityUtils.requireUserId());
    }
}
