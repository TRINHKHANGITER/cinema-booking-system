package com.dev.cinemasystem.service;


import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.showTimeDTO.ShowTimeCreationResquest;
import com.dev.cinemasystem.dto.showTimeDTO.ShowTimeResponse;
import com.dev.cinemasystem.dto.showTimeDTO.ShowTimeSearchDto;
import com.dev.cinemasystem.dto.showTimeDTO.ShowTimeSearchRequest;
import com.dev.cinemasystem.dto.showTimeDTO.ShowTimeUpdateResquest;
import com.dev.cinemasystem.dto.showTimeDTO.FullShowtimeMovieResponse;
import com.dev.cinemasystem.entity.Movie;
import com.dev.cinemasystem.entity.Room;
import com.dev.cinemasystem.entity.ShowTime;
import com.dev.cinemasystem.entity.ShowTimeSeat;
import com.dev.cinemasystem.enums.SeatStatus;
import com.dev.cinemasystem.enums.ShowTimeSeatStatus;
import com.dev.cinemasystem.enums.ShowTimeStatus;
import com.dev.cinemasystem.enums.SortDirection;
import com.dev.cinemasystem.enums.TicketStatus;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.dev.cinemasystem.mapper.MovieMapper;
import com.dev.cinemasystem.mapper.ShowTimeMapper;
import com.dev.cinemasystem.repository.MovieRepository;
import com.dev.cinemasystem.repository.RoomRepository;
import com.dev.cinemasystem.repository.SeatRepository;
import com.dev.cinemasystem.repository.ShowTimeRepository;
import com.dev.cinemasystem.repository.ShowTimeSeatRepository;
import com.dev.cinemasystem.repository.TicketRepository;
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
import java.util.Arrays;
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
    TicketRepository ticketRepository;
    ShowTimeMapper showTimeMapper;
    MovieMapper movieMapper;

    private void validateShowTimeRange(LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime == null || endTime == null || !endTime.isAfter(startTime)) {
            throw new AppException(ErrorCode.INVALID_SHOWTIME_RANGE);
        }
    }

    private void validateRequiredShowTimeFields(ShowTime showTime) {
        if (showTime.getReleaseDate() == null) {
            throw new AppException(ErrorCode.RELEASE_DATE_BLANK);
        }
        if (showTime.getStartTime() == null) {
            throw new AppException(ErrorCode.START_TIME_BLANK);
        }
        if (showTime.getEndTime() == null) {
            throw new AppException(ErrorCode.END_TIME_BLANK);
        }
        if (showTime.getStatus() == null) {
            throw new AppException(ErrorCode.SHOWTIME_STATUS_BLANK);
        }
    }

    private void validateShowTimeAgainstMovieReleaseDate(LocalDateTime showTimeStartDateTime, Movie movie) {
        if (movie == null || movie.getReleaseDate() == null || showTimeStartDateTime == null) {
            return;
        }

        if (showTimeStartDateTime.toLocalDate().isBefore(movie.getReleaseDate())) {
            throw new AppException(ErrorCode.SHOWTIME_BEFORE_MOVIE_RELEASE_DATE);
        }
    }

    private void validateShowTimeNotInPast(LocalDateTime showTimeStartDateTime) {
        if (showTimeStartDateTime == null) {
            return;
        }

        if (showTimeStartDateTime.isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.SHOWTIME_BEFORE_CURRENT_TIME);
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

    private LocalDateTime getStartDateTime(ShowTime showTime) {
        return combineDateTime(showTime.getReleaseDate(), showTime.getStartTime());
    }

    private LocalDateTime getEndDateTime(ShowTime showTime) {
        LocalDateTime start = getStartDateTime(showTime);
        LocalDateTime end = combineDateTime(showTime.getReleaseDate(), showTime.getEndTime());
        return normalizeEnd(start, end);
    }

    private boolean isOverlapping(
            LocalDateTime firstStart,
            LocalDateTime firstEnd,
            LocalDateTime secondStart,
            LocalDateTime secondEnd
    ) {
        return firstStart.isBefore(secondEnd) && firstEnd.isAfter(secondStart);
    }

    private void validateNoOverlappingShowTime(
            Integer roomId,
            Integer excludedShowTimeId,
            LocalDateTime startDateTime,
            LocalDateTime endDateTime
    ) {
        List<ShowTime> roomShowTimes = showTimeRepository.findAllByRoom_RoomIdAndStatusNot(
                roomId,
                ShowTimeStatus.CANCELLED
        );

        boolean hasOverlap = roomShowTimes.stream()
                .filter(existing ->
                        excludedShowTimeId == null || !existing.getShowTimeId().equals(excludedShowTimeId)
                )
                .anyMatch(existing -> {
                    LocalDateTime existingStart = getStartDateTime(existing);
                    LocalDateTime existingEnd = getEndDateTime(existing);
                    return isOverlapping(startDateTime, endDateTime, existingStart, existingEnd);
                });

        if (hasOverlap) {
            throw new AppException(ErrorCode.SHOWTIME_ALREADY_EXISTS);
        }
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

    public List<String> getAllShowTimeStatuses() {
        return Arrays.stream(ShowTimeStatus.values())
                .map(Enum::name)
                .toList();
    }

    public FullShowtimeMovieResponse getShowTimeById(Integer showTimeId) {
        var showTime = showTimeRepository.findById(showTimeId)
                .orElseThrow(() -> {
                    log.error("ShowTime with id {} not found", showTimeId);
                    return new AppException(ErrorCode.SHOWTIME_NOT_FOUND);
                });
        List<ShowTime> movieShowTimes = showTimeRepository
                .findAllByMovie_MovieIdOrderByReleaseDateAscStartTimeAscShowTimeIdAsc(showTime.getMovie().getMovieId());
        log.info("Retrieving showTime with id: {}", showTimeId);
        return toShowtimeMovieResponse(showTime.getMovie(), movieShowTimes);
    }

    public FullShowtimeMovieResponse createShowTime(ShowTimeCreationResquest request) {
        if (request == null) {
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

        var roomSeats = seatRepository.findAllByRoom_RoomId(room.getRoomId());
        if (roomSeats.isEmpty()) {
            throw new AppException(ErrorCode.ROOM_HAS_NO_SEATS);
        }

        var showTime = showTimeMapper.toShowTimeFromShowTimeCreationRequest(request);
        showTime.setRoom(room);
        showTime.setMovie(movie);
        validateRequiredShowTimeFields(showTime);

        LocalDateTime startDateTime = getStartDateTime(showTime);
        LocalDateTime endDateTime = getEndDateTime(showTime);
        validateShowTimeRange(startDateTime, endDateTime);
        validateShowTimeAgainstMovieReleaseDate(startDateTime, movie);
        validateShowTimeNotInPast(startDateTime);
        validateNoOverlappingShowTime(showTime.getRoom().getRoomId(), null, startDateTime, endDateTime);

        log.info("Creating showTime for movie id {} in room id {} at time {}", request.getMovieId(), request.getRoomId(), request.getStartTime());
        ShowTime savedShowTime = showTimeRepository.save(showTime);
        initializeSeatInventoryForShowTime(savedShowTime);
        List<ShowTime> movieShowTimes = showTimeRepository
                .findAllByMovie_MovieIdOrderByReleaseDateAscStartTimeAscShowTimeIdAsc(savedShowTime.getMovie().getMovieId());
        return toShowtimeMovieResponse(savedShowTime.getMovie(), movieShowTimes);
    }

    public FullShowtimeMovieResponse updateShowTime(Integer showTimeId, ShowTimeUpdateResquest request) {
        if (request == null) {
            log.error("ShowTime update request is null");
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        var showTime = showTimeRepository.findById(showTimeId)
                .orElseThrow(() -> {
                    log.error("ShowTime with id {} not found", showTimeId);
                    return new AppException(ErrorCode.SHOWTIME_NOT_FOUND);
                });

        Integer previousRoomId = showTime.getRoom().getRoomId();
        Movie targetMovie = showTime.getMovie();
        if (request.getMovieId() != null) {
            targetMovie = movieRepository.findById(request.getMovieId()).orElseThrow(() -> {
                log.error("Movie with id {} not found", request.getMovieId());
                return new AppException(ErrorCode.MOVIE_NOT_FOUND);
            });
        }

        Room targetRoom = showTime.getRoom();
        if (request.getRoomId() != null) {
            targetRoom = roomRepository.findById(request.getRoomId()).orElseThrow(() -> {
                log.error("Room with id {} not found", request.getRoomId());
                return new AppException(ErrorCode.ROOM_NOT_FOUND);
            });
        }

        showTimeMapper.updateShowTimeInfo(showTime, request);
        showTime.setMovie(targetMovie);
        showTime.setRoom(targetRoom);
        validateRequiredShowTimeFields(showTime);

        LocalDateTime startDateTime = getStartDateTime(showTime);
        LocalDateTime endDateTime = getEndDateTime(showTime);
        validateShowTimeRange(startDateTime, endDateTime);
        validateShowTimeAgainstMovieReleaseDate(startDateTime, showTime.getMovie());
        validateShowTimeNotInPast(startDateTime);
        validateNoOverlappingShowTime(
                showTime.getRoom().getRoomId(),
                showTime.getShowTimeId(),
                startDateTime,
                endDateTime
        );

        log.info("Updating showTime with id: {}", showTimeId);
        ShowTime savedShowTime = showTimeRepository.save(showTime);
        if (!previousRoomId.equals(savedShowTime.getRoom().getRoomId())) {
            initializeSeatInventoryForShowTime(savedShowTime);
        }
        List<ShowTime> movieShowTimes = showTimeRepository
                .findAllByMovie_MovieIdOrderByReleaseDateAscStartTimeAscShowTimeIdAsc(savedShowTime.getMovie().getMovieId());
        return toShowtimeMovieResponse(savedShowTime.getMovie(), movieShowTimes);
    }

    public boolean deleteShowTime(Integer showTimeId) {
        var showTime = showTimeRepository.findById(showTimeId)
                .orElseThrow(() -> {
                    log.error("ShowTime with id {} not found", showTimeId);
                    return new AppException(ErrorCode.SHOWTIME_NOT_FOUND);
                });

        boolean hasActiveTickets = ticketRepository.existsByShow_ShowTimeIdAndStatus(
                showTimeId,
                TicketStatus.ACTIVE
        );
        if (hasActiveTickets) {
            throw new AppException(ErrorCode.SHOWTIME_HAS_ACTIVE_TICKETS);
        }

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

    public PagingDto<FullShowtimeMovieResponse> getShowTimes(
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

        PagingDto<FullShowtimeMovieResponse> response = buildMovieGroupedPagingResponse(
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

    public PagingDto<ShowTimeResponse> getShowTimesByFilters(
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

        Page<ShowTime> showTimePage = showTimeRepository.findAllByFilters(
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

        List<ShowTimeResponse> items = showTimePage.getContent().stream()
                .map(showTimeMapper::toShowTimeResponse)
                .toList();

        PagingDto<ShowTimeResponse> response = PagingDto.<ShowTimeResponse>builder()
                .items(items)
                .currentPage(showTimePage.getNumber() + 1)
                .pageSize(showTimePage.getSize())
                .totalItems(showTimePage.getTotalElements())
                .totalPages(showTimePage.getTotalPages())
                .build();

        log.info(
                "Retrieved {} showtimes with filters provinceId={}, cinemaId={}, movieTypeId={}, releaseDate={}, releaseDateCondition={}, name={}, movieId={}, status={}",
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

    public PagingDto<FullShowtimeMovieResponse> getGroupedShowTimesByFilters(
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

        PagingDto<FullShowtimeMovieResponse> response = buildMovieGroupedPagingResponse(
                uniqueMoviePage,
                provinceId,
                cinemaId,
                movieTypeId,
                releaseDate,
                normalizedReleaseDateCondition,
                normalizedName,
                movieId,
                status,
                uniqueMoviePage.getNumber() + 1,
                uniqueMoviePage.getSize()
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

    private PagingDto<FullShowtimeMovieResponse> buildMovieGroupedPagingResponse(
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
            return PagingDto.<FullShowtimeMovieResponse>builder()
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

        List<FullShowtimeMovieResponse> items = movieIds.stream()
                .map(currentMovieId -> {
                    ShowTime representativeShowTime = representativeByMovieId.get(currentMovieId);
                    List<ShowTime> movieShowTimes = showTimesByMovieId.getOrDefault(currentMovieId, List.of(representativeShowTime));
                    return toShowtimeMovieResponse(representativeShowTime.getMovie(), movieShowTimes);
                })
                .toList();

        return PagingDto.<FullShowtimeMovieResponse>builder()
                .items(items)
                .currentPage(currentPage)
                .pageSize(pageSize)
                .totalItems(uniqueMoviePage.getTotalElements())
                .totalPages(uniqueMoviePage.getTotalPages())
                .build();
    }

    private FullShowtimeMovieResponse toShowtimeMovieResponse(Movie movie, List<ShowTime> showTimes) {
        List<ShowTimeResponse> showTimeResponses = showTimes.stream()
                .map(showTimeMapper::toShowTimeResponse)
                .toList();

        return FullShowtimeMovieResponse.builder()
                .movie(movieMapper.toMovieResponse(movie))
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

    public PagingDto<ShowTimeSearchDto> searchShowTimes(ShowTimeSearchRequest request) {
        Pageable pageable = PageRequest.of(request.getPage() - 1, request.getSize());
        Page<ShowTimeSearchDto> showTimePage = showTimeRepository.searchShowTimes(
                request.getKeyword(),
                request.getMovieTypeId(),
                request.getCinemaId(),
                request.getRoomTypeId(),
                request.getDateFrom(),
                request.getDateTo(),
                ParseTime.toLocalTime(request.getTimeFrom()),
                ParseTime.toLocalTime(request.getTimeTo()),
                pageable
        );

        log.info("Searching showTimes with keyword: {}", request.getKeyword());
        return PagingDto.<ShowTimeSearchDto>builder()
                .items(showTimePage.getContent())
                .currentPage(showTimePage.getNumber() + 1)
                .totalItems(showTimePage.getTotalElements())
                .totalPages(showTimePage.getTotalPages())
                .pageSize(showTimePage.getSize())
                .build();
    }
}
