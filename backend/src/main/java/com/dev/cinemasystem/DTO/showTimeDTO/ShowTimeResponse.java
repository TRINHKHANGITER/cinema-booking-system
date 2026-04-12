package com.dev.cinemasystem.dto.showTimeDTO;

import com.dev.cinemasystem.enums.ShowTimeStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ShowTimeResponse {

    Integer showTimeId;
    LocalDateTime startTime;
    LocalDateTime endTime;
    LocalDateTime sellStartTime;
    LocalDateTime sellEndTime;
    Integer roomId;
    Integer movieId;
    ShowTimeStatus status;

}

