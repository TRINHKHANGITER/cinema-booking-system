package com.dev.cinemasystem.mapper;



import com.dev.cinemasystem.entity.Movie;
import com.dev.cinemasystem.dto.movieDTO.MovieCreationResquest;
import com.dev.cinemasystem.dto.movieDTO.MovieResponse;
import com.dev.cinemasystem.dto.movieDTO.MovieUpdateResquest;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", uses = MovieTypeMapper.class)
public interface MovieMapper {
    List<MovieResponse> toMovieResponseList(List<Movie> movies);

    @Mapping(source = "movieType.movieTypeId", target = "movieTypeId")
    MovieResponse toMovieResponse(Movie movie);

    @Mapping(source = "movieTypeId", target = "movieType.movieTypeId")
    @Mapping(target = "movieId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "imageLandscape", ignore = true)
    @Mapping(target = "imagePortrait", ignore = true)
    Movie toMovieFromMovieCreationRequest(MovieCreationResquest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "movieId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "movieType", ignore = true)
    @Mapping(target = "imageLandscape", ignore = true)
    @Mapping(target = "imagePortrait", ignore = true)
    void updateMovieInfo(@MappingTarget Movie movie, MovieUpdateResquest request);

}
