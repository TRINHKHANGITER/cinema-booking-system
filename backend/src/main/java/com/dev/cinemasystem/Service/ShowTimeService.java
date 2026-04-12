package com.dev.cinemasystem.Service;


import com.dev.cinemasystem.Entity.Movie;
import com.dev.cinemasystem.Entity.Room;
import com.dev.cinemasystem.Entity.ShowTime;
import com.dev.cinemasystem.Exception.AppException;
import com.dev.cinemasystem.Exception.ErrorCode;
import com.dev.cinemasystem.Mapper.ShowTimeMapper;
import com.dev.cinemasystem.Repository.MovieRepository;
import com.dev.cinemasystem.Repository.RoomRepository;
import com.dev.cinemasystem.Repository.SeatRepository;
import com.dev.cinemasystem.Repository.ShowTimeRepository;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.showTimeDTO.*;
import com.dev.cinemasystem.enums.SortDirection;
import com.dev.cinemasystem.enums.ShowTimeStatus;
import com.dev.cinemasystem.utils.ParseTime;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ShowTimeService {

    ShowTimeRepository showTimeRepository;
    RoomRepository roomRepository;
    MovieRepository movieRepository;
    SeatRepository seatRepository;
    ShowTimeMapper showTimeMapper;

    private void validateShowTimeRange(LocalDateTime startTime, LocalDateTime endTime){
        if(startTime == null || endTime == null || !endTime.isAfter(startTime)){
            throw new AppException(ErrorCode.INVALID_SHOWTIME_RANGE);
        }
    }

    private LocalDateTime combineDateTime(LocalDate date, LocalTime time) {
        if (date == null || time == null) return null;
        return LocalDateTime.of(date, time);
    }

    private LocalDateTime normalizeEnd(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) return end;
        return end.isAfter(start) ? end : end.plusDays(1);
    }

    private LocalDateTime getStartDateTime(com.dev.cinemasystem.Entity.ShowTime showTime) {
        return combineDateTime(showTime.getReleaseDate(), showTime.getStartTime());
    }

    private LocalDateTime getEndDateTime(com.dev.cinemasystem.Entity.ShowTime showTime) {
        LocalDateTime start = getStartDateTime(showTime);
        LocalDateTime end = combineDateTime(showTime.getReleaseDate(), showTime.getEndTime());
        return normalizeEnd(start, end);
    }

    private Sort buildShowTimeSort(String sortBy, SortDirection direction) {
        Sort.Direction sortDirection = direction == SortDirection.DESC ? Sort.Direction.DESC : Sort.Direction.ASC;
        if (sortBy == null || sortBy.isBlank() || "showtime".equalsIgnoreCase(sortBy)) {
            return Sort.by(sortDirection, "releaseDate", "startTime");
        }

        if ("starttime".equalsIgnoreCase(sortBy)) {
            return Sort.by(sortDirection, "startTime");
        }
        if ("endtime".equalsIgnoreCase(sortBy)) {
            return Sort.by(sortDirection, "endTime");
        }
        if ("releasedate".equalsIgnoreCase(sortBy)) {
            return Sort.by(sortDirection, "releaseDate", "startTime");
        }
        if ("showtimeid".equalsIgnoreCase(sortBy)) {
            return Sort.by(sortDirection, "showTimeId");
        }

        return Sort.by(sortDirection, "releaseDate", "startTime");
    }



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

        LocalDateTime startDateTime = request.getStartTime();
        LocalDateTime endDateTime = normalizeEnd(startDateTime, request.getEndTime());
        validateShowTimeRange(startDateTime, endDateTime);

        if(showTimeRepository.existsOverlappingShowTime(request.getRoomId(), startDateTime, endDateTime)){
            log.error("ShowTime for movie id {} in room id {} at time {} already exists", request.getMovieId(), request.getRoomId(), request.getStartTime());
            throw new AppException(ErrorCode.SHOWTIME_ALREADY_EXISTS);
        }

        // Mandatory business rule (within existing tables): load all seats from this room at showtime creation time.
        var roomSeats = seatRepository.findAllByRoom_RoomId(room.getRoomId());
        if(roomSeats.isEmpty()){
            throw new AppException(ErrorCode.ROOM_HAS_NO_SEATS);
        }

        var showTime = showTimeMapper.toShowTimeFromShowTimeCreationRequest(request);
        showTime.setRoom(room);
        showTime.setMovie(movie);
        showTime.setStatus(ShowTimeStatus.SCHEDULED);
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

        LocalDateTime startDateTime = getStartDateTime(showTime);
        LocalDateTime endDateTime = getEndDateTime(showTime);
        validateShowTimeRange(startDateTime, endDateTime);

        int countOverlapping = showTimeRepository.countOverlappingShowTime(
                showTime.getShowTimeId(),
                showTime.getRoom().getRoomId(),
                startDateTime,
                endDateTime
        );
        if(countOverlapping > 0){
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
        showTime.setStatus(ShowTimeStatus.CANCELLED);
        showTimeRepository.save(showTime);
        log.info("Deleted showTime with id: {}", showTimeId);
        return true;
    }

    public PagingDto<ShowTimeResponse> getShowTimes(
            Integer cinemaId,
            ShowTimeStatus status,
            int page,
            int size,
            String sortBy,
            SortDirection direction
    ) {
        if (page < 0) {
            log.error("Invalid page number: {}", page);
            throw new AppException(ErrorCode.INVALID_PAGE_NUMBER);
        }
        if (size < 1) {
            log.error("Invalid page size: {}", size);
            throw new AppException(ErrorCode.INVALID_PAGE_SIZE);
        }

        Pageable pageable = PageRequest.of(page, size, buildShowTimeSort(sortBy, direction));
        Page<ShowTime> showTimePage;

        if (cinemaId != null && status != null) {
            showTimePage = showTimeRepository.findAllByRoom_Cinema_CinemaIdAndStatus(cinemaId, status, pageable);
        } else if (cinemaId != null) {
            showTimePage = showTimeRepository.findAllByRoom_Cinema_CinemaId(cinemaId, pageable);
        } else if (status != null) {
            showTimePage = showTimeRepository.findAllByStatus(status, pageable);
        } else {
            showTimePage = showTimeRepository.findAll(pageable);
        }

        List<ShowTimeResponse> showTimeResponses = showTimePage.getContent()
                .stream()
                .map(showTimeMapper::toShowTimeResponse)
                .toList();

        log.info("Retrieved {} showtimes with filters cinemaId={}, status={}", showTimeResponses.size(), cinemaId, status);
        return PagingDto.<ShowTimeResponse>builder()
                .items(showTimeResponses)
                .currentPage(showTimePage.getNumber())
                .pageSize(showTimePage.getSize())
                .totalItems(showTimePage.getTotalElements())
                .totalPages(showTimePage.getTotalPages())
                .build();
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

