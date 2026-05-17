package com.dev.cinemasystem.controller;


import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.paymentDTO.PaymentCreationRequest;
import com.dev.cinemasystem.dto.paymentDTO.PaymentResponse;
import com.dev.cinemasystem.dto.paymentDTO.PaymentUpdateRequest;
import com.dev.cinemasystem.enums.PaymentStatus;
import com.dev.cinemasystem.service.PaymentService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payment")
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentController {
    PaymentService paymentService;

    @PostMapping
    public ApiResponse<PaymentResponse> createPayment(@RequestBody PaymentCreationRequest paymentCreationRequest) {
        return ApiResponse.<PaymentResponse>builder()
                .result(paymentService.createPayment(paymentCreationRequest))
                .build();
    }

    @PatchMapping("/{paymentId}")
    public ApiResponse<Boolean> updatePayment(
            @PathVariable Integer paymentId,
            @RequestBody PaymentUpdateRequest request
    ) {
        paymentService.updatePayment(paymentId, request);
        return ApiResponse.<Boolean>builder()
                .result(true)
                .build();
    }

    @GetMapping
    public ApiResponse<List<PaymentResponse>> getPayments(@RequestParam(required = false) PaymentStatus status) {
        return ApiResponse.<List<PaymentResponse>>builder()
                .result(paymentService.getPayments(status))
                .build();
    }

    @GetMapping("/{paymentId}")
    public ApiResponse<PaymentResponse> getPaymentById(@PathVariable Integer paymentId) {
        return ApiResponse.<PaymentResponse>builder()
                .result(paymentService.getPaymentById(paymentId))
                .build();
    }


}
