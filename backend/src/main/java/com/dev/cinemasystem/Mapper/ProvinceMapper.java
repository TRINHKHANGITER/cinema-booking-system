package com.dev.cinemasystem.Mapper;

import com.dev.cinemasystem.Entity.Province;
import com.dev.cinemasystem.dto.provinceDTO.ProvinceResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProvinceMapper {
    ProvinceResponse toProvinceResponse(Province province);
}
