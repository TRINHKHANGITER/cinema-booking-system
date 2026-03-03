package com.dev.cinemasystem.dto.showTimeDTO;

import jakarta.validation.constraints.Pattern;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ShowTimeSearchRequest {
    String keyword;
    Integer movieTypeId;
    Integer cinemaId;
    Integer roomTypeId;
    LocalDate dateFrom;
    LocalDate dateTo;

    @Pattern(
            regexp = "^([01]\\d|2[0-3])(:?[0-5]\\d)(:?([0-5]\\d))?$",
            message = "TIME_INVALID"
    )
    String  timeFrom;

    @Pattern(
            regexp = "^([01]\\d|2[0-3])(:?[0-5]\\d)(:?([0-5]\\d))?$",
            message = "TIME_INVALID"
    )
    String  timeTo;

    Integer page;
    Integer size;
}