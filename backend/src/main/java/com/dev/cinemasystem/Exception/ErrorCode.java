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


    // user
    USER_NOT_FOUND("USER_NOT_FOUND", HttpStatus.NOT_FOUND, "User not found"),
    FULLNAME_BLANK("FULLNAME_BLANK", HttpStatus.BAD_REQUEST, "Full name is required"),
    PHONE_NUMBER_BLANK("PHONE_NUMBER_BLANK", HttpStatus.BAD_REQUEST, "Phone number is required"),
    IDENTITY_CODE_BLANK("IDENTITY_CODE_BLANK", HttpStatus.BAD_REQUEST, "Identity code is required"),
    SEX_INVALID("SEX_INVALID", HttpStatus.BAD_REQUEST, "Sex must be male, female or other"),
    EMAIL_BLANK("EMAIL_BLANK", HttpStatus.BAD_REQUEST, "Email is required"),
    PASSWORD_BLANK("PASSWORD_BLANK", HttpStatus.BAD_REQUEST, "Password is required"),
    PASSWORD_INVALID("PASSWORD_INVALID", HttpStatus.BAD_REQUEST, "Password must be at least 8 characters"),
    USERNAME_EXISTS("USERNAME_EXISTS", HttpStatus.BAD_REQUEST, "Username is already existed"),
    EMAIL_EXISTS("EMAIL_EXISTS", HttpStatus.BAD_REQUEST, "Email is already existed"),
    PHONE_NUMBER_EXISTS("PHONE_NUMBER_EXISTS", HttpStatus.BAD_REQUEST, "Phone number is already existed"),
    EMAIL_INVALID("EMAIL_INVALID", HttpStatus.BAD_REQUEST, "Email is invalid"),
    PHONE_NUMBER_INVALID("PHONE_NUMBER_INVALID", HttpStatus.BAD_REQUEST, "Phone number is at least 10 to 15 digits"),
    USERNAME_BLANK("USERNAME_BLANK", HttpStatus.BAD_REQUEST, "Username is required"),

    ADDRESS_NOT_FOUND("ADDRESS_NOT_FOUND", HttpStatus.NOT_FOUND, "Address not found"),

    INVALID_PAGE_NUMBER("INVALID_PAGE_NUMBER", HttpStatus.BAD_REQUEST, "Page number must be greater than or equal to 1"),
    INVALID_PAGE_SIZE("INVALID_PAGE_SIZE", HttpStatus.BAD_REQUEST, "Page size must be between 1 and 10"),

    CINEMA_ADDRESS_EXISTS("CINEMA_ADDRESS_EXISTS", HttpStatus.BAD_REQUEST, "Cinema at this address already exists"),
    CINEMA_NOT_FOUND("CINEMA_NOT_FOUND", HttpStatus.NOT_FOUND, "Cinema not found"),

    CINEMA_ALREADY_EXISTS_AT_THIS_ADDRESS("CINEMA_ALREADY_EXISTS_AT_THIS_ADDRESS", HttpStatus.BAD_REQUEST, "Cinema already exists at this address"),
    PROVINCE_NOT_FOUND("PROVINCE_NOT_FOUND", HttpStatus.NOT_FOUND, "Province not found"),

    WARD_NOT_FOUND("WARD_NOT_FOUND", HttpStatus.NOT_FOUND, "Ward not found"),
    CINEMA_ALREADY_EXISTS("CINEMA_ALREADY_EXISTS", HttpStatus.BAD_REQUEST, "Cinema already exists at this address"),
    INVALID_REQUEST("INVALID_REQUEST", HttpStatus.BAD_REQUEST, "Request is invalid")
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
