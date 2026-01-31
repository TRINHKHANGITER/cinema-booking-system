package com.dev.cinemasystem.Mapper;



import com.dev.cinemasystem.Entity.Province;
import com.dev.cinemasystem.dto.ProvinceDTO.ProvinceDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProvinceMapper {
    ProvinceDto toDto(Province province);
}
