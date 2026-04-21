package com.dev.cinemasystem.mapper;

import com.dev.cinemasystem.entity.MovieType;
import com.dev.cinemasystem.dto.movieTypeDTO.MovieTypeCreationRequest;
import com.dev.cinemasystem.dto.movieTypeDTO.MovieTypeResponse;
import com.dev.cinemasystem.dto.movieTypeDTO.MovieTypeUpdateRequest;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface MovieTypeMapper {
    MovieTypeResponse toMovieTypeResponse(MovieType seatType);

    MovieType toMovieTypeFromMovieCreationRequest(MovieTypeCreationRequest request);

    List<MovieTypeResponse> toMovieTypeResponseList(List<MovieType> seatTypes);

    @BeanMapping(nullValuePropertyMappingStrategy = org.mapstruct.NullValuePropertyMappingStrategy.IGNORE)
    void updateMovieTypeInfo(@MappingTarget MovieType seatType, MovieTypeUpdateRequest request);
}

