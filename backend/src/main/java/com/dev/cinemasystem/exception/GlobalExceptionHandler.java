package com.dev.cinemasystem.exception;

import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import jakarta.validation.ConstraintViolation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.Map;
import java.util.Objects;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    String MIN_ATTRIBUTE = "min";

    @ExceptionHandler(value = Exception.class)
    ResponseEntity<ApiResponse> handlingRuntimeException(Exception  exception){
        ApiResponse apiResponse = new ApiResponse();
        log.error("Unhandled exception caught: ", exception);
        apiResponse.setCode(ErrorCode.UNCATEGORIZED_EXCEPTION.getCode());
        apiResponse.setMessage(ErrorCode.UNCATEGORIZED_EXCEPTION.getMessage());

        return ResponseEntity.badRequest().body(apiResponse);
    }

    @ExceptionHandler(value = AppException.class)
    ResponseEntity<ApiResponse> handlingAppException(AppException exception){
        ErrorCode errorCode = exception.getErrorCode();
        ApiResponse apiResponse = new ApiResponse();

        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(errorCode.getMessage());

        return ResponseEntity
                .status(errorCode.getStatusCode())
                .body(apiResponse);
    }

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse> handlingValidation(MethodArgumentNotValidException exception){
        String enumKey = exception.getFieldError().getDefaultMessage();
        log.error("exception=========", exception);
        log.info("=========" +enumKey);
        ErrorCode errorCode = ErrorCode.UNCATEGORIZED_EXCEPTION;

        Map<String, Object> attributes = null;
        String messageError = null;

        try {
            errorCode = ErrorCode.valueOf(enumKey);

            var bindingResult = exception.getBindingResult();
            // handle map attribute
            var allErrors = bindingResult.getAllErrors();
            var constrainViolation = allErrors.get(0).unwrap(ConstraintViolation.class);
            attributes = constrainViolation.getConstraintDescriptor().getAttributes();
            log.info("attributes: {}", attributes);

            if (Objects.nonNull(attributes)) {
                messageError = mapAttribute(errorCode.getMessage(), attributes, MIN_ATTRIBUTE);
            }

        } catch (IllegalArgumentException e){
            log.info("=========" +enumKey + errorCode.getMessage());

        }
        ApiResponse apiResponse = new ApiResponse();

        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(Objects.nonNull(messageError) ? messageError : errorCode.getMessage());

        return ResponseEntity.badRequest().body(apiResponse);

    }

    @ExceptionHandler(value = MaxUploadSizeExceededException.class)
    ResponseEntity<ApiResponse> handlingMaxUploadSizeExceeded(MaxUploadSizeExceededException exception){
        ErrorCode errorCode = ErrorCode.FILE_SIZE_EXCEEDED;
        ApiResponse apiResponse = new ApiResponse();

        log.warn("Upload size exceeded: {}", exception.getMessage());

        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(errorCode.getMessage());

        return ResponseEntity
                .status(errorCode.getStatusCode())
                .body(apiResponse);
    }

    private String mapAttribute(String message, Map<String, Object> attributes, String nameAttribute) {
        String minValue = String.valueOf(attributes.get(nameAttribute));

        return message.replace("{" + nameAttribute + "}", minValue);
    }


}
