package com.dev.cinemasystem.Service;


import com.dev.cinemasystem.Entity.Movie;
import com.dev.cinemasystem.Entity.Room;
import com.dev.cinemasystem.Exception.AppException;
import com.dev.cinemasystem.Exception.ErrorCode;
import com.dev.cinemasystem.Mapper.ShowTimeMapper;
import com.dev.cinemasystem.Repository.MovieRepository;
import com.dev.cinemasystem.Repository.RoomRepository;
import com.dev.cinemasystem.Repository.ShowTimeRepository;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.showTimeDTO.*;
import com.dev.cinemasystem.enums.Status;
import com.dev.cinemasystem.utils.ParseTime;
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
public class ShowTimeService {

    ShowTimeRepository showTimeRepository;
    RoomRepository roomRepository;
    MovieRepository movieRepository;
    ShowTimeMapper showTimeMapper;




    public ShowTimeResponse getShowTimeById(Integer showTimeId){
        var showTime = showTimeRepository.findById(showTimeId)
                .orElseThrow(() -> {
                    log.error("ShowTime with id {} not found", showTimeId);
                    return new AppException(ErrorCode.PRICE_TICKET_NOT_FOUND);
                });
        log.info("Retrieving showTime with id: {}", showTimeId);
        return showTimeMapper.toShowTimeResponse(showTime);
    }

    public  ShowTimeResponse createShowTime(ShowTimeCreationResquest request){
        if(request == null){
            log.error("ShowTime creation request is null");
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        var room = roomRepository.findById(request.getRoomId()).orElseThrow(() -> {
            log.error("Room id {} not found", request.getRoomId());
            return new AppException(ErrorCode.ROOM_NOT_FOUND);
        });

        var movie = movieRepository.findById(request.getMovieId()).orElseThrow(() -> {
            log.error("Movie id {} not found", request.getMovieId());
            return new AppException(ErrorCode.MOVIE_NOT_FOUND);
        });

        if(showTimeRepository.existsOverlappingShowTime(request.getMovieId(), request.getRoomId(), Status.active, request.getReleaseDate(), ParseTime.toLocalTime(request.getStartTime()),ParseTime.toLocalTime (request.getEndTime()) )){
            log.error("ShowTime for movie id {} in room id {} at time {} already exists", request.getMovieId(), request.getRoomId(), request.getStartTime());
            throw new AppException(ErrorCode.SHOWTIME_ALREADY_EXISTS);
        }
        var showTime = showTimeMapper.toShowTimeFromShowTimeCreationRequest(request);
        showTime.setRoom(room);
        showTime.setMovie(movie);
        showTime.setStatus(Status.active);
        log.info("Creating showTime for movie id {} in room id {} at time {}", request.getMovieId(), request.getRoomId(), request.getStartTime());
        return showTimeMapper.toShowTimeResponse(showTimeRepository.save(showTime));
    }


    public ShowTimeResponse  updateShowTime(Integer showTimeId, ShowTimeUpdateResquest request){

        if(request == null){
            log.error("ShowTime update request is null");
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        var showTime = showTimeRepository.findById(showTimeId)
                .orElseThrow(() -> {
                    log.error("ShowTime with id {} not found", showTimeId);
                    return new AppException(ErrorCode.MOVIE_NOT_FOUND);
                });
        Movie movie = null;
        if(request.getMovieId() != null){
            movie = movieRepository.findById(request.getMovieId()).orElseThrow(() -> {
                log.error("Movie with id {} not found", request.getMovieId());
                return new AppException(ErrorCode.MOVIE_NOT_FOUND);
            });
        }
        Room room = null;
        if(request.getRoomId() != null) {
            room = roomRepository.findById(request.getRoomId()).orElseThrow(() -> {
                log.error("Room with id {} not found", request.getRoomId());
                return new AppException(ErrorCode.ROOM_NOT_FOUND);
            });
        }
        showTimeMapper.updateShowTimeInfo( showTime, request);
        if(movie != null){
            showTime.setMovie(movie);
        }
        if(room != null){
            showTime.setRoom(room);
        }
        int countOverlapping = showTimeRepository.countOverlappingShowTime(
                showTime.getMovie().getMovieId(),
                showTime.getRoom().getRoomId(),
                Status.active,
                showTime.getReleaseDate(),
                showTime.getStartTime(),
                showTime.getEndTime()
        );
        if(countOverlapping > 2){
            log.error("ShowTime for movie id {} in room id {} at time {} already exists", showTime.getMovie().getMovieId(), showTime.getRoom().getRoomId(), showTime.getStartTime());
            throw new AppException(ErrorCode.SHOWTIME_ALREADY_EXISTS);
        }
        log.info("Updating showTime with id: {}", showTimeId);
        return showTimeMapper.toShowTimeResponse(showTimeRepository.save(showTime));

    }

    public boolean deleteShowTime(Integer showTimeId){
        var showTime = showTimeRepository.findById(showTimeId)
                .orElseThrow(() -> {
                    log.error("ShowTime with id {} not found", showTimeId);
                    return new AppException(ErrorCode.MOVIE_NOT_FOUND);
                });
        showTime.setStatus(Status.deleted);
        showTimeRepository.save(showTime);
        log.info("Deleted showTime with id: {}", showTimeId);
        return true;
    }

    public PagingDto<ShowTimeSearchDto> searchShowTimes(ShowTimeSearchRequest resquest){
        Pageable pageable = PageRequest.of(resquest.getPage() - 1, resquest.getSize());
        Page<ShowTimeSearchDto> showTimePage = showTimeRepository.searchShowTimes(
                resquest.getKeyword(),
                resquest.getMovieTypeId(),
                resquest.getCinemaId(),
                resquest.getRoomTypeId(),
                resquest.getDateFrom(),
                resquest.getDateTo(),
                ParseTime.toLocalTime(resquest.getTimeFrom()),
                ParseTime.toLocalTime(resquest.getTimeTo()),
                pageable
        );

        log.info("Searching showTimes with keyword: {}", resquest.getKeyword());
        return PagingDto.<ShowTimeSearchDto>builder()
                .items(showTimePage.getContent())
                .currentPage(showTimePage.getNumber() + 1)
                .totalItems(showTimePage.getTotalElements())
                .totalPages(showTimePage.getTotalPages())
                .pageSize(showTimePage.getSize())
                .build();
    }
}
