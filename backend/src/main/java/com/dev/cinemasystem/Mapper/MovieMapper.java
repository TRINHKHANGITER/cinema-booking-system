package com.dev.cinemasystem.Mapper;



import com.dev.cinemasystem.Entity.Movie;
import com.dev.cinemasystem.dto.movieDTO.MovieCreationResquest;
import com.dev.cinemasystem.dto.movieDTO.MovieResponse;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface MovieMapper {
    List<MovieResponse> toMovieResponseList(List<Movie> movies);

    @Mapping(source = "movieType.movieTypeId", target = "movieTypeId")
//    @Mapping(source = "room.roomId", target = "roomId")
    MovieResponse toMovieResponse(Movie movie);

    @Mapping(source = "movieTypeId", target = "movieType.movieTypeId")
//    @Mapping(source = "roomId", target = "room.roomId")
    Movie toMovieFromMovieCreationRequest(MovieCreationResquest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateMovieInfo(@MappingTarget Movie movie, MovieCreationResquest request);

}
