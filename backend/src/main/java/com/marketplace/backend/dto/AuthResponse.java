package com.marketplace.backend.dto;

public class AuthResponse {
    private String token;
    private UserResponse user;
    private String pendingEmail;
    private String devOtp; // only when app.otp.expose-in-response=true
    private String message;

    public static AuthResponse token(String token, UserResponse user) {
        AuthResponse r = new AuthResponse();
        r.token = token;
        r.user = user;
        return r;
    }

    public static AuthResponse pending(String email, String devOtp, String message) {
        AuthResponse r = new AuthResponse();
        r.pendingEmail = email;
        r.devOtp = devOtp;
        r.message = message;
        return r;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public UserResponse getUser() { return user; }
    public void setUser(UserResponse user) { this.user = user; }
    public String getPendingEmail() { return pendingEmail; }
    public void setPendingEmail(String pendingEmail) { this.pendingEmail = pendingEmail; }
    public String getDevOtp() { return devOtp; }
    public void setDevOtp(String devOtp) { this.devOtp = devOtp; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
