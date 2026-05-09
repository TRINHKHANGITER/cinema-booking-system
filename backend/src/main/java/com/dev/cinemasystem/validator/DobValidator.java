package com.dev.cinemasystem.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@FieldDefaults(level = AccessLevel.PRIVATE)
public class DobValidator implements ConstraintValidator<DobConstraint, LocalDate> {
    int min;

    @Override
    public boolean isValid(LocalDate localDate, ConstraintValidatorContext constraintValidatorContext) {
        long years = ChronoUnit.YEARS.between(localDate, LocalDate.now());
        return years >= min;
    }

    @Override
    public void initialize(DobConstraint constraintAnnotation) {
        ConstraintValidator.super.initialize(constraintAnnotation);
        min = constraintAnnotation.min();
    }
}
