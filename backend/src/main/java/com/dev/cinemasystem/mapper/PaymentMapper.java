package com.dev.cinemasystem.mapper;

import com.dev.cinemasystem.dto.paymentDTO.PaymentCreationRequest;
import com.dev.cinemasystem.dto.paymentDTO.PaymentResponse;
import com.dev.cinemasystem.dto.paymentDTO.PaymentUpdateRequest;
import com.dev.cinemasystem.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PaymentMapper {
    Payment toPayment(PaymentCreationRequest paymentCreationRequest);

    void updatePayment(@MappingTarget Payment payment, PaymentUpdateRequest paymentUpdateRequest);

    PaymentResponse toPaymentResponse(Payment payment);

}
