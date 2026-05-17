package com.dev.cinemasystem.controller;

import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.checkoutDTO.CheckoutRequest;
import com.dev.cinemasystem.service.CheckoutService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/checkout/vnpay")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CheckoutController {
    CheckoutService checkoutService;

    @PostMapping
    public ApiResponse<String> createCheckout(
            @RequestBody @Valid CheckoutRequest request,
            HttpServletRequest servletRequest
    ) {
        return ApiResponse.<String>builder()
                .result(checkoutService.createCheckout(request, extractClientIp(servletRequest)))
                .build();
    }

    @GetMapping("/return")
    public boolean handleReturn(@RequestParam Map<String, String> queryParams) {
        return checkoutService.handleVnpayReturn(queryParams);
    }

    @GetMapping("/ipn")
    public Map<String, String> handleIpn(@RequestParam Map<String, String> queryParams) {
        return checkoutService.handleVnpayIpn(queryParams);
    }

    private String extractClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(forwardedFor)) {
            return forwardedFor.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (StringUtils.hasText(realIp)) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }
}
