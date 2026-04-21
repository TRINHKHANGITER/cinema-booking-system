package com.dev.cinemasystem.enums;


import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public enum PaymentMethod {
    CASH("Thanh toán tại quầy"),
    CARD("Thanh toán bằng thẻ ngân hàng"),
    BANK_TRANSFER("Chuyển khoản ngân hàng"),
    E_WALLET("Thanh toán qua ví điện tử")
    ;

    String description;

    PaymentMethod(String description) {
        this.description = description;
    }
}
