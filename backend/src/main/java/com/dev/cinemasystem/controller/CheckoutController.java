package com.dev.cinemasystem.controller;

import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.checkoutDTO.CheckoutRequest;
import com.dev.cinemasystem.service.CheckoutService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/checkout/vnpay")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CheckoutController {
    CheckoutService checkoutService;

    @PostMapping
    public ApiResponse<String> checkout (
            @RequestBody CheckoutRequest checkoutRequest,
            HttpServletRequest request
    ) {
        String ipAddress = extractClientIp(request);

        System.out.println("In checkout: " + checkoutRequest);

        return ApiResponse.<String>builder()
                .result(checkoutService.checkout(checkoutRequest, ipAddress))
                .build();
    }

    @GetMapping("/return")
    public boolean paymentUrl(@RequestParam Map<String, String> params) {
        return checkoutService.handleReturn(params);
    }

    @GetMapping("/ipn")
    public void paymentIpn(@RequestParam Map<String, String> params) {
        checkoutService.handleIpn(params);
    }

    private String extractClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        // "X-Forwarded-For" là một HTTP header đặc biệt.
        // Nó thường được thêm bởi:
        //     Proxy
        //     Load balancer (Nginx, AWS ELB, Cloudflare,...)
        // 👉 Khi có proxy ở giữa, request.getRemoteAddr() sẽ không phải IP thật của user, mà là IP của proxy.
        // 👉 Vì vậy, "X-Forwarded-For" sẽ chứa IP thật ban đầu.
        // Ví dụ: X-Forwarded-For: 192.168.1.10, 10.0.0.1
        // IP đầu tiên: client thật
        // IP sau: các proxy trung gian

        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }

        return request.getRemoteAddr();
        // getRemoteAddr() trả về IP của request trực tiếp đến server
        // 👉 Dùng khi:
        //     Không có proxy
        //     Hoặc header không tồn tại
    }
}
