package com.marketplace.backend.service;

import com.marketplace.backend.dto.*;
import com.marketplace.backend.exception.ApiException;
import com.marketplace.backend.model.User;
import com.marketplace.backend.repository.UserRepository;
import com.marketplace.backend.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ActivityService activityService;
    private final EmailService emailService;
    private final GoogleAuthService googleAuthService;
    private final SecureRandom random = new SecureRandom();

    @Value("${app.otp.length:6}")
    private int otpLength;

    @Value("${app.otp.expiration-minutes:10}")
    private int otpExpirationMinutes;

    // Forces OTP into the API response/console even when email sending
    // succeeds. Leave false in production — the fallback in maybeExposeOtp
    // already reveals the OTP automatically whenever email isn't configured
    // or a send fails, so this flag is only for deliberately keeping dev-mode
    // on even with SMTP set up.
    @Value("${app.otp.expose-in-response:false}")
    private boolean exposeOtp;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            ActivityService activityService,
            EmailService emailService,
            GoogleAuthService googleAuthService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.activityService = activityService;
        this.emailService = emailService;
        this.googleAuthService = googleAuthService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (!request.isAgreedToTerms()) {
            throw new ApiException("You must agree to the Terms of Service", HttpStatus.BAD_REQUEST);
        }
        if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new ApiException("Email already registered", HttpStatus.CONFLICT);
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRegistrationIntent(request.getRegistrationIntent());
        user.setOnboardingStage("kyc_pending");
        user.setEmailVerified(false);
        user.setRole(null);

        User.KycDetails kyc = new User.KycDetails();
        kyc.setIdType(request.getIdType());
        kyc.setIdNumber(request.getIdNumber());
        kyc.setDateOfBirth(request.getDob());
        kyc.setAddress(request.getAddress());
        kyc.setAgreedToTerms(true);
        user.setKycDetails(kyc);

        String otp = generateOtp();
        user.setOtpCode(otp);
        user.setOtpExpiresAt(Instant.now().plus(otpExpirationMinutes, ChronoUnit.MINUTES));
        user.setUpdatedAt(Instant.now());

        userRepository.save(user);
        activityService.log(user.getId(), "register");

        return AuthResponse.pending(
                user.getEmail(),
                maybeExposeOtp(user.getEmail(), otp),
                "Account created. Verify the OTP sent to your email."
        );
    }

    public AuthResponse verifyOtp(OtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new ApiException("Invalid email or OTP", HttpStatus.BAD_REQUEST));

        if (user.getOtpCode() == null || user.getOtpExpiresAt() == null) {
            throw new ApiException("No OTP pending for this account", HttpStatus.BAD_REQUEST);
        }
        if (Instant.now().isAfter(user.getOtpExpiresAt())) {
            throw new ApiException("OTP has expired. Request a new one.", HttpStatus.BAD_REQUEST);
        }
        if (!user.getOtpCode().equals(request.getCode())) {
            throw new ApiException("Invalid OTP code", HttpStatus.BAD_REQUEST);
        }

        user.setEmailVerified(true);
        user.setOtpCode(null);
        user.setOtpExpiresAt(null);
        user.setOnboardingStage("role_selection");
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
        activityService.log(user.getId(), "otp_verified");

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());
        return AuthResponse.token(token, UserResponse.from(user));
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new ApiException("Invalid email or password", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ApiException("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }
        if (!user.isEmailVerified()) {
            // Re-issue OTP so they can finish verification
            String otp = generateOtp();
            user.setOtpCode(otp);
            user.setOtpExpiresAt(Instant.now().plus(otpExpirationMinutes, ChronoUnit.MINUTES));
            userRepository.save(user);
            AuthResponse pending = AuthResponse.pending(
                    user.getEmail(),
                    maybeExposeOtp(user.getEmail(), otp),
                    "Email not verified. A new OTP has been sent."
            );
            return pending;
        }

        activityService.log(user.getId(), "login");
        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());
        return AuthResponse.token(token, UserResponse.from(user));
    }

    /**
     * Google already verified this email address, so a Google sign-in both
     * registers new accounts and logs in existing ones in one step — no OTP,
     * and no KYC form is collected up front (unlike password registration).
     * It also doubles as a rescue path for an existing account stuck
     * unverified because an OTP email never arrived.
     */
    public AuthResponse loginWithGoogle(GoogleAuthRequest request) {
        GoogleAuthService.TokenInfo info = googleAuthService.verify(request.getCredential());
        String email = info.email().toLowerCase().trim();

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = new User();
            user.setName(info.name() != null && !info.name().isBlank() ? info.name() : email);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(randomUnusablePassword()));
            user.setOnboardingStage("role_selection");
            user.setEmailVerified(true);
            user.setUpdatedAt(Instant.now());
            userRepository.save(user);
            activityService.log(user.getId(), "register_google");
        } else if (!user.isEmailVerified()) {
            user.setEmailVerified(true);
            user.setOtpCode(null);
            user.setOtpExpiresAt(null);
            if ("kyc_pending".equals(user.getOnboardingStage())) {
                user.setOnboardingStage("role_selection");
            }
            user.setUpdatedAt(Instant.now());
            userRepository.save(user);
            activityService.log(user.getId(), "login_google");
        } else {
            activityService.log(user.getId(), "login_google");
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());
        return AuthResponse.token(token, UserResponse.from(user));
    }

    public AuthResponse resendOtp(String email) {
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new ApiException("Account not found", HttpStatus.NOT_FOUND));
        if (user.isEmailVerified()) {
            throw new ApiException("Email already verified", HttpStatus.BAD_REQUEST);
        }
        String otp = generateOtp();
        user.setOtpCode(otp);
        user.setOtpExpiresAt(Instant.now().plus(otpExpirationMinutes, ChronoUnit.MINUTES));
        userRepository.save(user);
        return AuthResponse.pending(user.getEmail(), maybeExposeOtp(user.getEmail(), otp), "OTP resent.");
    }

    public UserResponse me(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        return UserResponse.from(user);
    }

    private String generateOtp() {
        int bound = (int) Math.pow(10, otpLength);
        int code = random.nextInt(bound / 10, bound);
        return String.valueOf(code);
    }

    /** A Google-only account still needs *some* password hash — PasswordEncoder.matches
     * throws on a null encoded value — but it must never be guessable or usable for login. */
    private String randomUnusablePassword() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return java.util.Base64.getEncoder().encodeToString(bytes);
    }

    /**
     * Emails the OTP when SMTP is configured. Falls back to console-printing
     * and returning it in the API response whenever sending isn't possible
     * (not configured, or the send itself fails) so registration still works
     * end-to-end without SMTP set up.
     */
    private String maybeExposeOtp(String email, String otp) {
        boolean sent = emailService.sendOtp(email, otp);
        boolean reveal = exposeOtp || !sent;
        if (reveal) {
            System.out.println("[PrepplusHub OTP] " + email + " => " + otp);
        }
        return reveal ? otp : null;
    }
}
