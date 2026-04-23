package com.dev.cinemasystem.dto.movieTypeDTO;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MovieTypeCreationRequest {

    @NotBlank(message = "MOVIE_TYPE_NAME_BLANK")
    String movieTypeName;

    @NotBlank(message = "DESCRIPTION_BLANK")
    String description;

}
