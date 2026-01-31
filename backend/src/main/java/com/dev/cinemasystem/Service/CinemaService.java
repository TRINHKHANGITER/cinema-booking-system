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
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.cinemaDTO.CinemaCreationRequest;
import com.dev.cinemasystem.dto.cinemaDTO.CinemaResponse;
import com.dev.cinemasystem.dto.cinemaDTO.CinemaUpdateRequest;
import com.dev.cinemasystem.dto.wardDTO.WardDto;
import com.dev.cinemasystem.enums.Status;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

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

    public PagingDto<CinemaResponse> getAllCinemas( Integer provinceCode, Status status, int page, int size) {
        if (page < 1) {
            log.error("Invalid page number: {}", page);
            throw new AppException(ErrorCode.INVALID_PAGE_NUMBER);
        }
        if (size < 1 ) {
            log.error("Invalid page size: {}", size);
            throw new AppException(ErrorCode.INVALID_PAGE_SIZE);
        }
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Cinema> cinemaPage;
        if(provinceCode != null && status != null){
            cinemaPage = cinemaRepository.findByAddress_Province_CodeAndStatus(provinceCode, status, pageable);
        }else if(provinceCode != null){
            cinemaPage = cinemaRepository.findByAddress_Province_Code(provinceCode, pageable);
        }else if(status != null){
            cinemaPage = cinemaRepository.findByStatus(status, pageable);
        }else{
            cinemaPage = cinemaRepository.findAll(pageable);
        }
        List<CinemaResponse> cinemaResponses = cinemaMapper.toResponseList(cinemaPage.getContent());
        log.info("Retrieved {} cinemas", cinemaResponses.size());
        return PagingDto.<CinemaResponse>builder()
                .items(cinemaResponses)
                .pageSize(size)
                .currentPage(page)
                .totalItems(cinemaPage.getTotalElements())
                .totalPages(cinemaPage.getTotalPages() )
                .build();
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
                throw new AppException(ErrorCode.CINEMA_ALREADY_EXISTS_AT_THIS_ADDRESS);
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


    @Transactional
    public CinemaResponse updateCinema(int cinemaId, CinemaUpdateRequest request) {

        Cinema existingCinema = cinemaRepository.findById(cinemaId)
                .orElseThrow(() -> new AppException(ErrorCode.CINEMA_NOT_FOUND));

        if (request == null) {
            log.error("Cinema update request is null");
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        cinemaMapper.updateEntityFromRequest(existingCinema, request);


        if (request.getAddress() == null
                || request.getAddress().getProvinceCode() == null
                || request.getAddress().getWardCode() == null) {

            Cinema saved = cinemaRepository.save(existingCinema);
            log.info("Updated cinema (no address change) id={}", saved.getCinemaId());
            return cinemaMapper.toResponse(saved);
        }

        Integer provinceCode = request.getAddress().getProvinceCode();
        Integer wardCode = request.getAddress().getWardCode();
        String addressDetail = request.getAddress().getAddressDetail();
        Address address = addressRepository
                .findByProvince_CodeAndWard_Code(provinceCode, wardCode)
                .orElse(null);

        if (address != null) {
            boolean addressUsedByOtherCinema =
                    cinemaRepository.existsByAddress_AddressIdAndCinemaIdNot(address.getAddressId(), cinemaId);

            if (addressUsedByOtherCinema) {
                log.error("Address already used by another cinema. addressId={}", address.getAddressId());
                throw new AppException(ErrorCode.CINEMA_ALREADY_EXISTS_AT_THIS_ADDRESS);
            }

            existingCinema.setAddress(address);
            Cinema saved = cinemaRepository.save(existingCinema);
            log.info("Updated cinema with existing address. cinemaId={}, addressId={}",
                    saved.getCinemaId(), address.getAddressId());
            return cinemaMapper.toResponse(saved);
        }
        ProvinceApiDto provinceApi = vietnamAddressApiService.getProvinceWithWards(provinceCode);
        if (provinceApi == null) {
            log.error("Province with code {} not found from API", provinceCode);
            throw new AppException(ErrorCode.PROVINCE_NOT_FOUND);
        }

        WardDto wardDto = provinceApi.getWards().stream()
                .filter(w -> w.getCode().equals(wardCode))
                .findFirst()
                .orElse(null);

        if (wardDto == null) {
            log.error("Ward with code {} not found in province {}", wardCode, provinceApi.getName());
            throw new AppException(ErrorCode.WARD_NOT_FOUND);
        }

        Province province = provinceRepository.findByCode(provinceApi.getCode())
                .orElseGet(() -> provinceRepository.save(
                        Province.builder()
                                .code(provinceApi.getCode())
                                .name(provinceApi.getName())
                                .build()
                ));

        Ward ward = wardRepository.findByCode(wardDto.getCode())
                .orElseGet(() -> wardRepository.save(
                        Ward.builder()
                                .code(wardDto.getCode())
                                .name(wardDto.getName())
                                .province(province)
                                .build()
                ));

        Address savedAddress = addressRepository.save(
                Address.builder()
                        .province(province)
                        .ward(ward)
                        .addressDetail(addressDetail)
                        .build()
        );

        boolean usedByOtherCinema =
                cinemaRepository.existsByAddress_AddressIdAndCinemaIdNot(savedAddress.getAddressId(), cinemaId);

        if (usedByOtherCinema) {
            throw new AppException(ErrorCode.CINEMA_ALREADY_EXISTS_AT_THIS_ADDRESS);
        }

        existingCinema.setAddress(savedAddress);

        Cinema saved = cinemaRepository.save(existingCinema);
        log.info("Updated cinema with new address. cinemaId={}, addressId={}", saved.getCinemaId(), savedAddress.getAddressId());
        return cinemaMapper.toResponse(saved);
    }


    public boolean deleteCinemaById(Integer cinemaId) {
        var cinema = cinemaRepository.findById(cinemaId)
                .orElseThrow(() -> new AppException(ErrorCode.CINEMA_NOT_FOUND));
        cinema.setStatus(Status.deleted);
        cinemaRepository.save(cinema);
        log.info("Deleted cinema with id: {}", cinemaId);
        return true;
    }

}
