package com.dev.cinemasystem.mapper;

import com.dev.cinemasystem.entity.Province;
import com.dev.cinemasystem.dto.provinceDTO.ProvinceResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProvinceMapper {
    ProvinceResponse toProvinceResponse(Province province);
}
