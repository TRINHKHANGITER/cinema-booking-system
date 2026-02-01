package com.dev.cinemasystem.dto.movieTypeDTO;

import com.dev.cinemasystem.enums.Status;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MovieTypeResponse {
    Integer movieTypeId;

    String movieTypeName;

    String description;
    Status status;
}
