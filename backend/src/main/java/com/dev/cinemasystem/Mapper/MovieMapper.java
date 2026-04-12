package com.dev.cinemasystem.Mapper;



import com.dev.cinemasystem.Entity.Movie;
import com.dev.cinemasystem.dto.movieDTO.MovieCreationResquest;
import com.dev.cinemasystem.dto.movieDTO.MovieResponse;
import com.dev.cinemasystem.dto.movieDTO.MovieUpdateResquest;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface MovieMapper {
    List<MovieResponse> toMovieResponseList(List<Movie> movies);

    @Mapping(source = "movieType.movieTypeId", target = "movieTypeId")
    @Mapping(source = "trailerUrl", target = "videoTrailer")
    @Mapping(source = "imageLandscape", target = "image")
    MovieResponse toMovieResponse(Movie movie);

    @Mapping(source = "movieTypeId", target = "movieType.movieTypeId")
    @Mapping(target = "movieId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "status", ignore = true)
    Movie toMovieFromMovieCreationRequest(MovieCreationResquest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "movieId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "movieType", ignore = true)
    void updateMovieInfo(@MappingTarget Movie movie, MovieUpdateResquest request);

}
