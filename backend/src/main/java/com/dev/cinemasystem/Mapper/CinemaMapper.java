package com.dev.cinemasystem.Mapper;


import com.dev.cinemasystem.Entity.Cinema;
import com.dev.cinemasystem.dto.ProvinceDTO.ProvinceDto;
import com.dev.cinemasystem.dto.addressDTO.AddressDto;
import com.dev.cinemasystem.dto.cinemaDTO.CinemaResponse;

import com.dev.cinemasystem.dto.cinemaDTO.CinemaUpdateRequest;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", uses = AddressMapper.class)
public interface CinemaMapper {

    CinemaResponse toResponse(Cinema c) ;


    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromRequest( @MappingTarget Cinema cinema, CinemaUpdateRequest request);

    List<CinemaResponse> toResponseList(List<Cinema> cinemas);


}

