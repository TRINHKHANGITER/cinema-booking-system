package com.dev.cinemasystem.dto.movieTypeDTO;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MovieTypeUpdateRequest {

    String movieTypeName;

    String description;

}
