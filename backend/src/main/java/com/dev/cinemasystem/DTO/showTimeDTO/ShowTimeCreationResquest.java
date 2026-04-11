package com.dev.cinemasystem.dto.showTimeDTO;


import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ShowTimeCreationResquest {

    @NotNull(message = "START_TIME_BLANK")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime startTime;

    @NotNull(message = "END_TIME_BLANK")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime endTime;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime sellStartTime;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime sellEndTime;

    @Min(value = 1, message = "ROOM_ID_INVALID")
    @NotNull(message = "ROOM_ID_BLANK")
    Integer roomId;

    @Min(value = 1, message = "MOVIE_ID_INVALID")
    @NotNull(message = "MOVIE_ID_BLANK")
    Integer movieId;

}
