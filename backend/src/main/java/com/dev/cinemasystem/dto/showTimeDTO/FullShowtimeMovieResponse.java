package com.dev.cinemasystem.dto.showTimeDTO;

import com.dev.cinemasystem.dto.movieDTO.MovieResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FullShowtimeMovieResponse {

    MovieResponse movie;

    List<ShowTimeResponse> showTimes;

}

