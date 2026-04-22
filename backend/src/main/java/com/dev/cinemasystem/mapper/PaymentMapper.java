package com.dev.cinemasystem.mapper;

import com.dev.cinemasystem.dto.paymentDTO.PaymentCreationRequest;
import com.dev.cinemasystem.dto.paymentDTO.PaymentResponse;
import com.dev.cinemasystem.dto.paymentDTO.PaymentUpdateRequest;
import com.dev.cinemasystem.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PaymentMapper {

    @Mapping(target = "paymentId", ignore = true)
    @Mapping(target = "order", ignore = true)
    @Mapping(target = "paidAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "status", ignore = true)
    Payment toPayment(PaymentCreationRequest paymentCreationRequest);

    @Mapping(target = "paymentId", ignore = true)
    @Mapping(target = "order", ignore = true)
    @Mapping(target = "amount", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "status", ignore = true)
    void updatePayment(@MappingTarget Payment payment, PaymentUpdateRequest paymentUpdateRequest);

    @Mapping(target = "orderId", source = "order.orderId")
    PaymentResponse toPaymentResponse(Payment payment);
}
