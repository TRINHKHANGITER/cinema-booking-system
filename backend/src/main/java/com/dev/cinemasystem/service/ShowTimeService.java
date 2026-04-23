package com.dev.cinemasystem.service;


import com.dev.cinemasystem.dto.roomDTO.RoomResponse;
import com.dev.cinemasystem.entity.Movie;
import com.dev.cinemasystem.entity.Room;
import com.dev.cinemasystem.entity.ShowTime;
import com.dev.cinemasystem.entity.ShowTimeSeat;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.dev.cinemasystem.mapper.ShowTimeMapper;
import com.dev.cinemasystem.repository.MovieRepository;
import com.dev.cinemasystem.repository.RoomRepository;
import com.dev.cinemasystem.repository.SeatRepository;
import com.dev.cinemasystem.repository.ShowTimeSeatRepository;
import com.dev.cinemasystem.repository.ShowTimeRepository;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.movieTypeDTO.MovieTypeResponse;
import com.dev.cinemasystem.dto.showTimeDTO.*;
import com.dev.cinemasystem.enums.SeatStatus;
import com.dev.cinemasystem.enums.ShowTimeSeatStatus;
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
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ShowTimeService {

    ShowTimeRepository showTimeRepository;
    RoomRepository roomRepository;
    MovieRepository movieRepository;
    SeatRepository seatRepository;
    ShowTimeSeatRepository showTimeSeatRepository;
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

    private LocalDateTime getStartDateTime(com.dev.cinemasystem.entity.ShowTime showTime) {
        return combineDateTime(showTime.getReleaseDate(), showTime.getStartTime());
    }

    private LocalDateTime getEndDateTime(com.dev.cinemasystem.entity.ShowTime showTime) {
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



    public ShowtimeMovieResponse getShowTimeById(Integer showTimeId){
        var showTime = showTimeRepository.findById(showTimeId)
                .orElseThrow(() -> {
                    log.error("ShowTime with id {} not found", showTimeId);
                    return new AppException(ErrorCode.PRICE_TICKET_NOT_FOUND);
                });
        List<ShowTime> movieShowTimes = showTimeRepository
                .findAllByMovie_MovieIdOrderByReleaseDateAscStartTimeAscShowTimeIdAsc(showTime.getMovie().getMovieId());
        log.info("Retrieving showTime with id: {}", showTimeId);
        return toShowtimeMovieResponse(showTime.getMovie(), movieShowTimes);
    }

    public  ShowtimeMovieResponse createShowTime(ShowTimeCreationResquest request){
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
        if (showTime.getReleaseDate() != null && !showTime.getReleaseDate().isAfter(LocalDate.now())) {
            showTime.setStatus(ShowTimeStatus.SELLING);
        } else {
            showTime.setStatus(ShowTimeStatus.SCHEDULED);
        }
        log.info("Creating showTime for movie id {} in room id {} at time {}", request.getMovieId(), request.getRoomId(), request.getStartTime());
        ShowTime savedShowTime = showTimeRepository.save(showTime);
        initializeSeatInventoryForShowTime(savedShowTime);
        List<ShowTime> movieShowTimes = showTimeRepository
                .findAllByMovie_MovieIdOrderByReleaseDateAscStartTimeAscShowTimeIdAsc(savedShowTime.getMovie().getMovieId());
        return toShowtimeMovieResponse(savedShowTime.getMovie(), movieShowTimes);
    }


    public ShowtimeMovieResponse  updateShowTime(Integer showTimeId, ShowTimeUpdateResquest request){

        if(request == null){
            log.error("ShowTime update request is null");
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        var showTime = showTimeRepository.findById(showTimeId)
                .orElseThrow(() -> {
                    log.error("ShowTime with id {} not found", showTimeId);
                    return new AppException(ErrorCode.MOVIE_NOT_FOUND);
                });
        Integer previousRoomId = showTime.getRoom().getRoomId();
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
        ShowTime savedShowTime = showTimeRepository.save(showTime);
        if (!previousRoomId.equals(savedShowTime.getRoom().getRoomId())) {
            initializeSeatInventoryForShowTime(savedShowTime);
        }
        List<ShowTime> movieShowTimes = showTimeRepository
                .findAllByMovie_MovieIdOrderByReleaseDateAscStartTimeAscShowTimeIdAsc(savedShowTime.getMovie().getMovieId());
        return toShowtimeMovieResponse(savedShowTime.getMovie(), movieShowTimes);

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

    private void initializeSeatInventoryForShowTime(ShowTime showTime) {
        var roomSeats = seatRepository.findAllByRoom_RoomId(showTime.getRoom().getRoomId());
        if (roomSeats.isEmpty()) {
            throw new AppException(ErrorCode.ROOM_HAS_NO_SEATS);
        }

        showTimeSeatRepository.deleteByShowTime_ShowTimeId(showTime.getShowTimeId());
        List<ShowTimeSeat> showTimeSeats = roomSeats.stream()
                .map(seat -> ShowTimeSeat.builder()
                        .showTime(showTime)
                        .seat(seat)
                        .status(seat.getStatus() == SeatStatus.ACTIVE
                                ? ShowTimeSeatStatus.AVAILABLE
                                : ShowTimeSeatStatus.BLOCKED)
                        .order(null)
                        .holdExpiresAt(null)
                        .build())
                .toList();
        showTimeSeatRepository.saveAll(showTimeSeats);
    }

    public PagingDto<ShowtimeMovieResponse> getShowTimes(
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
        Page<ShowTime> uniqueMoviePage = showTimeRepository.findAllByFiltersWithUniqueMovie(
                null,
                cinemaId,
                null,
                null,
                "EQ",
                null,
                null,
                status,
                pageable
        );

        PagingDto<ShowtimeMovieResponse> response = buildMovieGroupedPagingResponse(
                uniqueMoviePage,
                null,
                cinemaId,
                null,
                null,
                "EQ",
                null,
                null,
                status,
                uniqueMoviePage.getNumber(),
                uniqueMoviePage.getSize()
        );

        log.info("Retrieved {} grouped showtimes with filters cinemaId={}, status={}", response.getItems().size(), cinemaId, status);
        return response;
    }

    public PagingDto<ShowtimeMovieResponse> getShowTimesByFilters(
            Integer provinceId,
            Integer cinemaId,
            Integer movieTypeId,
            LocalDate releaseDate,
            String releaseDateCondition,
            String name,
            Integer movieId,
            ShowTimeStatus status,
            int page,
            int size,
            String sortBy,
            SortDirection direction
    ) {
        if (page < 1) {
            log.error("Invalid page number: {}", page);
            throw new AppException(ErrorCode.INVALID_PAGE_NUMBER);
        }
        if (size < 1) {
            log.error("Invalid page size: {}", size);
            throw new AppException(ErrorCode.INVALID_PAGE_SIZE);
        }

        String normalizedName = (name == null || name.isBlank()) ? null : name.trim();
        String normalizedReleaseDateCondition = normalizeReleaseDateCondition(releaseDateCondition);
        Pageable pageable = PageRequest.of(page - 1, size, buildShowTimeSort(sortBy, direction));

        Page<ShowTime> uniqueMoviePage = showTimeRepository.findAllByFiltersWithUniqueMovie(
                provinceId,
                cinemaId,
                movieTypeId,
                releaseDate,
                normalizedReleaseDateCondition,
                normalizedName,
                movieId,
                status,
                pageable
        );

        PagingDto<ShowtimeMovieResponse> response = buildMovieGroupedPagingResponse(
                uniqueMoviePage,
                provinceId,
                cinemaId,
                movieTypeId,
                releaseDate,
                normalizedReleaseDateCondition,
                normalizedName,
                movieId,
                status,
                page,
                size
        );

        log.info(
                "Retrieved {} grouped showtimes with filters provinceId={}, cinemaId={}, movieTypeId={}, releaseDate={}, releaseDateCondition={}, name={}, movieId={}, status={}",
                response.getItems().size(),
                provinceId,
                cinemaId,
                movieTypeId,
                releaseDate,
                normalizedReleaseDateCondition,
                normalizedName,
                movieId,
                status
        );

        return response;
    }



    private PagingDto<ShowtimeMovieResponse> buildMovieGroupedPagingResponse(
            Page<ShowTime> uniqueMoviePage,
            Integer provinceId,
            Integer cinemaId,
            Integer movieTypeId,
            LocalDate releaseDate,
            String releaseDateCondition,
            String name,
            Integer movieId,
            ShowTimeStatus status,
            int currentPage,
            int pageSize
    ) {
        List<ShowTime> representativeShowTimes = uniqueMoviePage.getContent();
        if (representativeShowTimes.isEmpty()) {
            return PagingDto.<ShowtimeMovieResponse>builder()
                    .items(List.of())
                    .currentPage(currentPage)
                    .pageSize(pageSize)
                    .totalItems(uniqueMoviePage.getTotalElements())
                    .totalPages(uniqueMoviePage.getTotalPages())
                    .build();
        }

        Map<Integer, ShowTime> representativeByMovieId = new LinkedHashMap<>();
        for (ShowTime showTime : representativeShowTimes) {
            representativeByMovieId.putIfAbsent(showTime.getMovie().getMovieId(), showTime);
        }

        List<Integer> movieIds = new ArrayList<>(representativeByMovieId.keySet());
        List<ShowTime> groupedShowTimes = showTimeRepository.findAllByFiltersAndMovieIds(
                provinceId,
                cinemaId,
                movieTypeId,
                releaseDate,
                releaseDateCondition,
                name,
                movieId,
                status,
                movieIds
        );

        Map<Integer, List<ShowTime>> showTimesByMovieId = new LinkedHashMap<>();
        for (ShowTime showTime : groupedShowTimes) {
            Integer groupedMovieId = showTime.getMovie().getMovieId();
            showTimesByMovieId.computeIfAbsent(groupedMovieId, ignored -> new ArrayList<>()).add(showTime);
        }

        List<ShowtimeMovieResponse> items = movieIds.stream()
                .map(currentMovieId -> {
                    ShowTime representativeShowTime = representativeByMovieId.get(currentMovieId);
                    List<ShowTime> movieShowTimes = showTimesByMovieId.getOrDefault(currentMovieId, List.of(representativeShowTime));
                    return toShowtimeMovieResponse(representativeShowTime.getMovie(), movieShowTimes);
                })
                .toList();

        return PagingDto.<ShowtimeMovieResponse>builder()
                .items(items)
                .currentPage(currentPage)
                .pageSize(pageSize)
                .totalItems(uniqueMoviePage.getTotalElements())
                .totalPages(uniqueMoviePage.getTotalPages())
                .build();
    }

    private ShowtimeMovieResponse toShowtimeMovieResponse(Movie movie, List<ShowTime> showTimes) {
        Integer movieTypeId = movie.getMovieType() != null ? movie.getMovieType().getMovieTypeId() : null;
        MovieTypeResponse movieType = movie.getMovieType() == null
                ? null
                : MovieTypeResponse.builder()
                .movieTypeId(movie.getMovieType().getMovieTypeId())
                .movieTypeName(movie.getMovieType().getMovieTypeName())
                .description(movie.getMovieType().getDescription())
                .status(movie.getMovieType().getStatus())
                .build();
        List<ShowTimeResponse> showTimeResponses = showTimes.stream()
                .map(showTimeMapper::toShowTimeResponse)
                .toList();

        return ShowtimeMovieResponse.builder()
                .movieId(movie.getMovieId())
                .movieName(movie.getMovieName())
                .description(movie.getDescription())
                .durationMinutes(movie.getDurationMinutes())
                .slug(movie.getSlug())
                .minimumAge(movie.getMinimumAge())
                .imageLandscape(movie.getImageLandscape())
                .imagePortrait(movie.getImagePortrait())
                .trailerUrl(movie.getTrailerUrl())
                .ratingAverage(movie.getRatingAverage())
                .totalVotes(movie.getTotalVotes())
                .releaseDate(movie.getReleaseDate())
                .endDate(movie.getEndDate())
                .country(movie.getCountry())
                .producer(movie.getProducer())
                .director(movie.getDirector())
                .actors(movie.getActors())
                .createdAt(movie.getCreatedAt())
                .updatedAt(movie.getUpdatedAt())
                .movieTypeId(movieTypeId)
                .movieType(movieType)
                .status(movie.getStatus())
                .showTimes(showTimeResponses)
                .build();
    }

    private String normalizeReleaseDateCondition(String releaseDateCondition) {
        if (releaseDateCondition == null || releaseDateCondition.isBlank()) {
            return "EQ";
        }

        return switch (releaseDateCondition.trim().toUpperCase()) {
            case "GT", "GTE", "EQ" -> releaseDateCondition.trim().toUpperCase();
            default -> "EQ";
        };
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
