package com.dev.cinemasystem.mapper;

import com.dev.cinemasystem.dto.provinceDTO.ProvinceCreationRequest;
import com.dev.cinemasystem.entity.Province;
import com.dev.cinemasystem.dto.provinceDTO.ProvinceResponse;
import com.dev.cinemasystem.dto.provinceDTO.ProvinceUpdateRequest;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProvinceMapper {
    ProvinceResponse toProvinceResponse(Province province);

    Province toProvinceFromProvinceCreationRequest(ProvinceCreationRequest request);

    List<ProvinceResponse> toProvinceResponseList(List<Province> provinces);

    @BeanMapping(nullValuePropertyMappingStrategy = org.mapstruct.NullValuePropertyMappingStrategy.IGNORE)
    void updateProvinceInfo(@MappingTarget Province province, ProvinceUpdateRequest request);
}
