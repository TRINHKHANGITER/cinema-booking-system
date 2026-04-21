package com.dev.cinemasystem.enums;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public enum PaymentStatus {
    PENDING("Đang chờ thanh toán"),
    PAID("Thanh toán thành công"),
    FAILED("Thanh toán thất bại"),
    EXPIRED("Hết thời gian thanh toán"),
    CANCELLED("Đã huỷ thanh toán");
    ;

    String description;

    PaymentStatus(String description) {
        this.description = description;
    }
}

