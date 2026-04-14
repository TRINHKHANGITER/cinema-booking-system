package com.dev.cinemasystem.Mapper;

import com.dev.cinemasystem.Entity.Cinema;
import com.dev.cinemasystem.dto.cinemaDTO.CinemaResponse;
import com.dev.cinemasystem.dto.cinemaDTO.CinemaUpdateRequest;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", uses = ProvinceMapper.class)
public interface CinemaMapper {

    @Mapping(target = "provinceId", source = "province.provinceId")
    @Mapping(target = "provinceName", source = "province.provinceName")
    @Mapping(target = "addressText", source = "addressText")
    CinemaResponse toResponse(Cinema c);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "province", ignore = true)
    void updateEntityFromRequest(@MappingTarget Cinema cinema, CinemaUpdateRequest request);

    List<CinemaResponse> toResponseList(List<Cinema> cinemas);
}
