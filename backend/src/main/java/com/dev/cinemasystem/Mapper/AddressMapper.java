package com.dev.cinemasystem.Mapper;



import com.dev.cinemasystem.Entity.Address;
import com.dev.cinemasystem.dto.addressDTO.AddressDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = ProvinceMapper.class)
public interface AddressMapper {
    AddressDto toDto(Address address);

}
