package com.dev.cinemasystem.enums;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public enum OrderComboStatus {
    PENDING("Chờ thanh toán"),
    BOOKED("Đã đặt"),
    CANCELLED("Đã hủy"),
    REFUNDED("Đã hoàn tiền")
    ;

    String description;

    OrderComboStatus(String description) {
        this.description = description;
    }
}

