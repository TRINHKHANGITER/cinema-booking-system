package com.dev.cinemasystem.service;


import com.dev.cinemasystem.entity.MovieType;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.dev.cinemasystem.mapper.MovieTypeMapper;
import com.dev.cinemasystem.repository.MovieTypeRepository;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.movieTypeDTO.MovieTypeResponse;
import com.dev.cinemasystem.dto.movieTypeDTO.MovieTypeCreationRequest;
import com.dev.cinemasystem.dto.movieTypeDTO.MovieTypeUpdateRequest;
import com.dev.cinemasystem.enums.MovieTypeStatus;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MovieTypeService {

   MovieTypeMapper movieTypeMapper;

   MovieTypeRepository movieTypeRepository;




    public MovieTypeResponse getMovieTypeById(Integer movieTypeId){
        var movieType = movieTypeRepository.findById(movieTypeId)
                .orElseThrow(() -> {
                    log.error("Movie type with id {} not found", movieTypeId);
                    return new AppException(ErrorCode.MOVIE_TYPE_NOT_FOUND);
                });
        log.info("Retrieving movie type with id: {}", movieTypeId);
        return movieTypeMapper.toMovieTypeResponse(movieType);
    }

    public MovieTypeResponse createMovieType(MovieTypeCreationRequest request){
        if(request == null){
            log.error("Movie type creation request is null");
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        if(movieTypeRepository.findByMovieTypeName(request.getMovieTypeName()) != null){
            log.error("Movie type name {} already exists", request.getMovieTypeName());
            throw new AppException(ErrorCode.MOVIE_TYPE_NAME_EXISTS);
        }
        var movieType = movieTypeMapper.toMovieTypeFromMovieCreationRequest(request);
        movieType.setStatus(MovieTypeStatus.ACTIVE);
        log.info("Creating movie type with name: {}", movieType.getMovieTypeName());
        return movieTypeMapper.toMovieTypeResponse(movieTypeRepository.save(movieType));
    }

    public PagingDto<MovieTypeResponse> getAllMovieTypes( MovieTypeStatus status, Integer page, Integer size){
        if (page < 1) {
            log.error("Invalid page number: {}", page);
            throw new AppException(ErrorCode.INVALID_PAGE_NUMBER);
        }
        if (size < 1 ) {
            log.error("Invalid page size: {}", size);
            throw new AppException(ErrorCode.INVALID_PAGE_SIZE);
        }
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<MovieType> movieTypePage;
        if(status != null){
            movieTypePage = movieTypeRepository.findAllByStatus(status, pageable);
        }else{
            movieTypePage = movieTypeRepository.findAll(pageable);
        }

        log.info("Fetching movie types - page: {}, size: {}", page, size);
        List<MovieTypeResponse> movieTypeResponses = movieTypeMapper.toMovieTypeResponseList(movieTypePage.getContent());
        return  PagingDto.<MovieTypeResponse>builder()
                .items(movieTypeResponses)
                .currentPage(page)
                .pageSize(size)
                .totalItems(movieTypePage.getTotalElements())
                .totalPages(movieTypePage.getTotalPages())
                .build();
    }

    public MovieTypeResponse  updateMovieType(Integer movieTypeId, MovieTypeUpdateRequest request){
        var movieType = movieTypeRepository.findById(movieTypeId)
                .orElseThrow(() -> {
                    log.error("Movie type with id {} not found", movieTypeId);
                    return new AppException(ErrorCode.MOVIE_TYPE_NOT_FOUND);
                });
        if(request == null){
            log.error("Movie type update request is null");
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        if(request.getMovieTypeName() != null){
           MovieType movietype2 = movieTypeRepository.findByMovieTypeName(request.getMovieTypeName());
            if( movietype2!= null && movietype2.getMovieTypeId() != movieTypeId){
                log.error("Movie type name {} already exists", request.getMovieTypeName());
                throw new AppException(ErrorCode.MOVIE_TYPE_NAME_EXISTS);
            }
        }
        log.info("Updating movie type with id: {}", movieTypeId);
        movieTypeMapper.updateMovieTypeInfo(movieType, request);
        return movieTypeMapper.toMovieTypeResponse(movieTypeRepository.save(movieType));

    }

    public boolean deleteMovieType(Integer movieTypeId){
        var movie = movieTypeRepository.findById(movieTypeId)
                .orElseThrow(() -> {
                    log.error("movieTypeId with id {} not found", movieTypeId);
                    return new AppException(ErrorCode.MOVIE_NOT_FOUND);
                });
        movie.setStatus(MovieTypeStatus.INACTIVE);
        movieTypeRepository.save(movie);
        log.info("Deleted movie with id: {}", movieTypeId);
        return true;
    }


}

