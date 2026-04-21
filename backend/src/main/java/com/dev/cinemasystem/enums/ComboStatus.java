package com.dev.cinemasystem.enums;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public enum ComboStatus {
    AVAILABLE("Có sẵn để sử dụng"),
    UNAVAILABLE("Tạm thời không khả dụng"),
    DISCONTINUED("Ngừng sử dụng vĩnh viễn")
    ;

    String description;

    ComboStatus(String description) {
        this.description = description;
    }
}

