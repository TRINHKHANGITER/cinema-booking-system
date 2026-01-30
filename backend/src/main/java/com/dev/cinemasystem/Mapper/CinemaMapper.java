package com.dev.cinemasystem.Mapper;


import com.dev.cinemasystem.Entity.Cinema;
import com.dev.cinemasystem.dto.ProvinceDTO.ProvinceDto;
import com.dev.cinemasystem.dto.addressDTO.AddressDto;
import com.dev.cinemasystem.dto.cinemaDTO.CinemaResponse;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = AddressMapper.class)
public interface CinemaMapper {

    CinemaResponse toResponse(Cinema c) ;

}

