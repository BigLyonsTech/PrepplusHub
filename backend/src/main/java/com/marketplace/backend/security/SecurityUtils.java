package com.marketplace.backend.security;

import com.marketplace.backend.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static UserPrincipal requireCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            throw new ApiException("Unauthorized", HttpStatus.UNAUTHORIZED);
        }
        return principal;
    }

    public static String requireUserId() {
        return requireCurrentUser().getId();
    }
}
