package com.dev.cinemasystem.mapper;

import com.dev.cinemasystem.dto.showTimeDTO.FullShowtimeMovieResponse;
import com.dev.cinemasystem.entity.Movie;
import com.dev.cinemasystem.entity.ShowTime;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {MovieMapper.class, ShowTimeMapper.class})
public interface FullShowtimeMovieMapper {

    @Mapping(target = "movie", source = "movie")
    @Mapping(target = "showTimes", source = "showTimes")
    FullShowtimeMovieResponse mapMovieWithShowTimes(Movie movie, List<ShowTime> showTimes);
}
