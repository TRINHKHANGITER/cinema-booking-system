package com.dev.cinemasystem.enums;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public enum TicketStatus {
    PENDING("Đang chờ thanh toán"),
    CONFIRMED("Đặt vé thành công"),
    CANCELLED("Đơn đã bị huỷ"),
    EXPIRED("Hết thời gian thanh toán")
    ;

    String description;

    TicketStatus(String description) {
        this.description = description;
    }
}

