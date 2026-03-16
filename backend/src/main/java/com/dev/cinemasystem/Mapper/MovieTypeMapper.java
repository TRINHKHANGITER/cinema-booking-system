package com.dev.cinemasystem.Mapper;

import com.dev.cinemasystem.Entity.MovieType;
import com.dev.cinemasystem.Entity.SeatType;
import com.dev.cinemasystem.dto.movieTypeDTO.MovieTypeCreationRequest;
import com.dev.cinemasystem.dto.movieTypeDTO.MovieTypeResponse;
import com.dev.cinemasystem.dto.movieTypeDTO.MovieTypeUpdateRequest;
import com.dev.cinemasystem.dto.seatTypeDTO.SeatTypeCreationRequest;
import com.dev.cinemasystem.dto.seatTypeDTO.SeatTypeResponse;
import com.dev.cinemasystem.dto.seatTypeDTO.SeatTypeUpdateRequest;
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

