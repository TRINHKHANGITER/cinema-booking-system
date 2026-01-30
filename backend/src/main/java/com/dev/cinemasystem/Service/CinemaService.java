package com.dev.cinemasystem.Service;


import com.dev.cinemasystem.Entity.Address;
import com.dev.cinemasystem.Entity.Cinema;
import com.dev.cinemasystem.Entity.Province;
import com.dev.cinemasystem.Entity.Ward;
import com.dev.cinemasystem.Exception.AppException;
import com.dev.cinemasystem.Exception.ErrorCode;
import com.dev.cinemasystem.Mapper.CinemaMapper;
import com.dev.cinemasystem.Repository.AddressRepository;
import com.dev.cinemasystem.Repository.CinemaRepository;
import com.dev.cinemasystem.Repository.ProvinceRepository;
import com.dev.cinemasystem.Repository.WardRepository;
import com.dev.cinemasystem.dto.ProvinceDTO.ProvinceApiDto;
import com.dev.cinemasystem.dto.cinemaDTO.CinemaCreationRequest;
import com.dev.cinemasystem.dto.cinemaDTO.CinemaResponse;
import com.dev.cinemasystem.dto.wardDTO.WardDto;
import com.dev.cinemasystem.enums.Status;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CinemaService {
    CinemaRepository cinemaRepository;
    CinemaMapper cinemaMapper;
    AddressRepository addressRepository;
    ProvinceRepository provinceRepository;
    WardRepository wardRepository;
    VietnamAddressApiService vietnamAddressApiService;


    public CinemaResponse getCinemaById(Integer cinemaId) {
        var cinema = cinemaRepository.findById(cinemaId)
                .orElseThrow(() -> new AppException(ErrorCode.CINEMA_NOT_FOUND));
        log.info("Retrieved cinema with id: {}", cinemaId);
        return cinemaMapper.toResponse(cinema);

    }

    public  CinemaResponse createCinema(CinemaCreationRequest resquest){
        if(resquest == null || resquest.getAddress() == null){
            log.error("Cinema creation request is null");
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        Address address =  addressRepository.findByProvince_CodeAndWard_Code(resquest.getAddress().getProvinceCode(), resquest.getAddress().getWardCode())
                .orElse(null);
        if(address != null){
            if(cinemaRepository.existsByAddress_AddressId(address.getAddressId())){
                log.error("Cinema with address already exists: {}", address);
                throw new AppException(ErrorCode.CINEMA_ALREADY_EXISTS);
            }else{
                Cinema cinema = Cinema.builder()
                        .cinemaName(resquest.getCinemaName())
                        .description(resquest.getDescription())
                        .address(address)
                        .status(Status.active)
                        .build();
                cinemaRepository.save(cinema);
                log.info("Created cinema with name: {}", cinema.getCinemaName());
                return cinemaMapper.toResponse(cinema);
            }
        }else{
            ProvinceApiDto provinceApiDto = vietnamAddressApiService.getProvinceWithWards(resquest.getAddress().getProvinceCode());
            if(provinceApiDto == null) {
                log.error("Province with code {} not found", resquest.getAddress().getProvinceCode());
                throw new AppException(ErrorCode.PROVINCE_NOT_FOUND);
            }

            Province province = Province.builder()
                    .code(provinceApiDto.getCode())
                    .name(provinceApiDto.getName())
                    .build();
            if(!provinceRepository.existsByCode(province.getCode())) {
                provinceRepository.save(province);
            }

            List<WardDto> wardDtos = provinceApiDto.getWards();
            int indexOfWard = wardDtos.indexOf(
                    wardDtos.stream()
                            .filter(wardDto -> wardDto.getCode().equals(resquest.getAddress().getWardCode()))
                            .findFirst()
                            .orElse(null)
            );
            if(indexOfWard == -1) {
                log.error("Ward with code {} not found in province {}", resquest.getAddress().getWardCode(), province.getName());
                throw new AppException(ErrorCode.INVALID_REQUEST);
            }
            WardDto wardDto = wardDtos.get(indexOfWard);
            Ward ward = Ward.builder()
                    .code(wardDto.getCode())
                    .name(wardDto.getName())
                    .province(province)
                    .build();
            if(!wardRepository.existsByCode(ward.getCode())){
                wardRepository.save(ward);
            }
            address = Address.builder()
                    .province(province)
                    .ward(ward)
                    .addressDetail(resquest.getAddress().getAddressDetail())
                    .build();
            addressRepository.save(address);
            Cinema cinema = Cinema.builder()
                    .cinemaName(resquest.getCinemaName())
                    .description(resquest.getDescription())
                    .address(address)
                    .status(Status.active)
                    .build();
            cinemaRepository.save(cinema);
            log.info("Created cinema with name: {}", cinema.getCinemaName());
            return cinemaMapper.toResponse(cinema);
        }
    }
}
