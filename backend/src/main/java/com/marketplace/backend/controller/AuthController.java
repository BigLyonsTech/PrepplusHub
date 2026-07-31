package com.marketplace.backend.controller;

import com.marketplace.backend.dto.*;
import com.marketplace.backend.security.SecurityUtils;
import com.marketplace.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/verify-otp")
    public AuthResponse verifyOtp(@Valid @RequestBody OtpRequest request) {
        return authService.verifyOtp(request);
    }

    @PostMapping("/resend-otp")
    public AuthResponse resendOtp(@RequestBody Map<String, String> body) {
        return authService.resendOtp(body.get("email"));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public UserResponse me() {
        return authService.me(SecurityUtils.requireUserId());
    }
}
