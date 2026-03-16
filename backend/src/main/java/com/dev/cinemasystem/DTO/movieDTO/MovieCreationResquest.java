package com.dev.cinemasystem.dto.movieDTO;


import com.dev.cinemasystem.enums.Status;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MovieCreationResquest {

    @NotBlank(message = "MOVIE_NAME_BLANK")
    String movieName;

    @NotBlank(message = "DESCRIPTION_BLANK")
    String description;

    @NotBlank(message = "VIDEO_TRAILER_BLANK")
    String videoTrailer;

    @NotNull(message = "IMAGE_BLANK")
    MultipartFile image;

    @Min(value = 1, message = "DURATION_MINUTES_INVALID")
    @NotNull(message = "DURATION_MINUTES_BLANK")
    Integer durationMinutes;

    @Min(value = 1, message = "MOVIE_TYPE_ID_INVALID")
    @NotNull(message = "MOVIE_TYPE_ID_BLANK")
    Integer movieTypeId;

}
