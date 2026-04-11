package com.dev.cinemasystem.enums;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;


@Getter
public enum GioiTinh {
    // legacy
    male,
    female,
    other,

    // designed
    MALE,
    FEMALE,
    OTHER

}



