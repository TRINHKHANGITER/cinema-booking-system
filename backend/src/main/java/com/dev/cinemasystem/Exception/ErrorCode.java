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
    ROOM_NOT_FOUND("ROOM_NOT_FOUND", HttpStatus.NOT_FOUND, "Room not found"),
    ROOM_TYPE_BLANK("ROOM_TYPE_BLANK", HttpStatus.BAD_REQUEST, "Room type is required"),
    ROOM_NAME_BLANK("ROOM_NAME_BLANK", HttpStatus.BAD_REQUEST, "Room name is required"),
    CAPACITY_BLANK("CAPACITY_BLANK", HttpStatus.BAD_REQUEST, "Capacity is required"),
    CINEMA_BLANK("CINEMA_BLANK", HttpStatus.BAD_REQUEST, "Cinema is required"),
    CAPACITY_INVALID("CAPACITY_INVALID", HttpStatus.BAD_REQUEST, "Capacity must be at least 1"),
    ROOM_TYPE_ID_INVALID("ROOM_TYPE_ID_INVALID", HttpStatus.BAD_REQUEST, "Room type ID must be at least 1"),
    CINEMA_ID_INVALID("CINEMA_ID_INVALID", HttpStatus.BAD_REQUEST, "Cinema ID must be at least 1"),

    ROOM_TYPE_NOT_FOUND("ROOM_TYPE_NOT_FOUND", HttpStatus.NOT_FOUND, "Room type not found"),

    ROOM_TYPE_NAME_EXISTS("ROOM_TYPE_NAME_EXISTS", HttpStatus.BAD_REQUEST, "Room type name already exists"),
    ROOM_TYPE_NAME_BLANK("ROOM_TYPE_NAME_BLANK", HttpStatus.BAD_REQUEST, "Room type name is required"),
    DESCRIPTION_BLANK("DESCRIPTION_BLANK", HttpStatus.BAD_REQUEST, "Description is required"),
    WARD_NOT_FOUND("WARD_NOT_FOUND", HttpStatus.NOT_FOUND, "Ward not found"),
    CINEMA_ALREADY_EXISTS("CINEMA_ALREADY_EXISTS", HttpStatus.BAD_REQUEST, "Cinema already exists at this address"),

    ROW_BLANK("ROW_BLANK", HttpStatus.BAD_REQUEST, "seatRow is required"),
    ROW_INVALID("ROW_INVALID", HttpStatus.BAD_REQUEST, "seatRow must be at least 1"),
    COLUMN_INVALID("COLUMN_INVALID", HttpStatus.BAD_REQUEST, "Column must be at least 1"),
    SEAT_TYPE_ID_INVALID("SEAT_TYPE_ID_INVALID", HttpStatus.BAD_REQUEST, "Seat type ID must be at least 1"),
    SEAT_TYPE_BLANK("SEAT_TYPE_BLANK", HttpStatus.BAD_REQUEST, "Seat type is required"),
    ROOM_ID_INVALID("ROOM_ID_INVALID", HttpStatus.BAD_REQUEST, "Room ID must be at least 1"),
    ROOM_BLANK("ROOM_BLANK", HttpStatus.BAD_REQUEST, "Room is required"),
    SEAT_TYPE_NAME_BLANK("SEAT_TYPE_NAME_BLANK", HttpStatus.BAD_REQUEST, "Seat type name is required"),
    SEAT_TYPE_NOT_FOUND("SEAT_TYPE_NOT_FOUND", HttpStatus.NOT_FOUND, "Seat type not found"),
    SEAT_TYPE_NAME_EXISTS("SEAT_TYPE_NAME_EXISTS", HttpStatus.BAD_REQUEST, "Seat type name already exists"),
    SEAT_NOT_FOUND("SEAT_NOT_FOUND", HttpStatus.NOT_FOUND, "Seat not found"),
    SEAT_ALREADY_EXISTS_IN_ROOM("SEAT_ALREADY_EXISTS_IN_ROOM", HttpStatus.BAD_REQUEST, "Seat already exists in room at given seatRow and seatColumn"),


    MOVIE_TYPE_NAME_BLANK("MOVIE_TYPE_NAME_BLANK", HttpStatus.BAD_REQUEST, "Movie type name is required"),
    MOVIE_TYPE_NOT_FOUND("MOVIE_TYPE_NOT_FOUND", HttpStatus.NOT_FOUND, "Movie type not found"),
    MOVIE_TYPE_NAME_EXISTS("MOVIE_TYPE_NAME_EXISTS", HttpStatus.BAD_REQUEST, "Movie type name already exists"),
    MOVIE_NOT_FOUND("MOVIE_NOT_FOUND", HttpStatus.NOT_FOUND, "Movie not found"),



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
