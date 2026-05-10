package com.dev.cinemasystem.validator;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(
        validatedBy = {DobValidator.class}
)
@Retention(RetentionPolicy.RUNTIME)
public @interface DobConstraint {
    String message() default "{Invalid date of birth!}";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    int min() default 0;
}
