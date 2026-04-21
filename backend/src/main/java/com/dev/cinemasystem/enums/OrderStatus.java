package com.dev.cinemasystem.enums;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public enum OrderStatus {
    CREATED("Đơn vừa được tạo"),
    PENDING("Đang chờ thanh toán"),
    CONFIRMED("Thanh toán thành công"),
    CANCELLED("Đơn đã bị huỷ"),
    EXPIRED("Hết thời gian thanh toán");
    ;

    String description;

    OrderStatus(String description) {
        this.description = description;
    }
}

