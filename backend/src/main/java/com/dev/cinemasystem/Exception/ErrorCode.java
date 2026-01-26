package com.dev.cinemasystem.Exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;


@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION("UNCATEGORIZED_EXCEPTION", HttpStatus.INTERNAL_SERVER_ERROR, "Uncategorized error"),
    UNAUTHENTICATED("UNAUTHENTICATED", HttpStatus.UNAUTHORIZED, "Unauthenticated"),
    UNAUTHORIZED("UNAUTHORIZED", HttpStatus.FORBIDDEN, "You do not have permission"),
    TOKEN_INVALID("TOKEN_INVALID", HttpStatus.BAD_REQUEST, "Token is invalid"),


    ;


    ErrorCode(String code, HttpStatusCode httpStatusCode , String message) {
        this.code = code;
        this.statusCode = httpStatusCode;
        this.message = message;
    }

    private String code;
    private HttpStatusCode statusCode;
    private String message;

}
