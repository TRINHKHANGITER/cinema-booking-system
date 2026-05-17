package com.dev.cinemasystem.service;

import com.dev.cinemasystem.dto.dashboardDTO.CinemaRevenueResponse;
import com.dev.cinemasystem.dto.dashboardDTO.ComboRevenueResponse;
import com.dev.cinemasystem.dto.dashboardDTO.DashboardOverviewResponse;
import com.dev.cinemasystem.dto.dashboardDTO.MovieRevenueResponse;
import com.dev.cinemasystem.dto.dashboardDTO.MovieTypeRevenueResponse;
import com.dev.cinemasystem.dto.dashboardDTO.OrderStatisticItemResponse;
import com.dev.cinemasystem.dto.dashboardDTO.OrderStatisticsResponse;
import com.dev.cinemasystem.dto.dashboardDTO.RevenueRankingResponse;
import com.dev.cinemasystem.dto.dashboardDTO.RevenueValue;
import com.dev.cinemasystem.enums.ComboDetailStatus;
import com.dev.cinemasystem.enums.OrderStatus;
import com.dev.cinemasystem.enums.TicketStatus;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DashboardService {
    static final String SORT_ASC = "ASC";
    static final String SORT_DESC = "DESC";

    OrderService orderService;
    UserService userService;
    MovieService movieService;
    CinemaService cinemaService;

    @Transactional(readOnly = true)
    public DashboardOverviewResponse getOverview(LocalDate startDate, LocalDate endDate) {
        validateDateRange(startDate, endDate);
        LocalDateTime startAt = startDate.atStartOfDay();
        LocalDateTime endAt = toEndOfDay(endDate);

        BigDecimal totalRevenue = orderService.sumPaidTotalAmountByCreatedAtRange(
                OrderStatus.PAID,
                startAt,
                endAt
        );
        Long totalOrderCount = orderService.countOrdersByCreatedAtRange(startAt, endAt);

        return DashboardOverviewResponse.builder()
                .startDate(startDate)
                .endDate(endDate)
                .totalRevenue(totalRevenue == null ? BigDecimal.ZERO : totalRevenue)
                .totalOrderCount(totalOrderCount == null ? 0L : totalOrderCount)
                .customerCount(userService.countUsers())
                .movieCount(movieService.countMovies())
                .cinemaCount(cinemaService.countCinemas())
                .build();
    }

    @Transactional(readOnly = true)
    public Long getCustomerCount() {
        return userService.countUsers();
    }

    @Transactional(readOnly = true)
    public Long getMovieCount() {
        return movieService.countMovies();
    }

    @Transactional(readOnly = true)
    public Long getCinemaCount() {
        return cinemaService.countCinemas();
    }

    @Transactional(readOnly = true)
    public RevenueRankingResponse<CinemaRevenueResponse> getRevenueByCinema(
            LocalDate startDate,
            LocalDate endDate,
            Integer provinceId,
            Integer cinemaId,
            Integer topN,
            String sortDirection,
            Integer page,
            Integer size
    ) {
        validateDateRange(startDate, endDate);
        validatePositiveOptional(provinceId);
        validatePositiveOptional(cinemaId);
        validateTopN(topN);
        String normalizedSortDirection = normalizeSortDirection(sortDirection);
        validatePageAndSize(page, size);

        List<CinemaRevenueResponse> rows = orderService.findRevenueByCinema(
                OrderStatus.PAID,
                startDate.atStartOfDay(),
                toEndOfDay(endDate),
                provinceId,
                cinemaId
        );

        return buildRankingResponse(startDate, endDate, rows, topN, normalizedSortDirection, page, size);
    }

    @Transactional(readOnly = true)
    public RevenueRankingResponse<MovieRevenueResponse> getRevenueByMovie(
            LocalDate startDate,
            LocalDate endDate,
            Integer movieId,
            Integer topN,
            String sortDirection,
            Integer page,
            Integer size
    ) {
        validateDateRange(startDate, endDate);
        validatePositiveOptional(movieId);
        validateTopN(topN);
        String normalizedSortDirection = normalizeSortDirection(sortDirection);
        validatePageAndSize(page, size);

        List<MovieRevenueResponse> rows = orderService.findRevenueByMovie(
                OrderStatus.PAID,
                startDate.atStartOfDay(),
                toEndOfDay(endDate),
                movieId
        );

        return buildRankingResponse(startDate, endDate, rows, topN, normalizedSortDirection, page, size);
    }

    @Transactional(readOnly = true)
    public RevenueRankingResponse<MovieTypeRevenueResponse> getRevenueByMovieType(
            LocalDate startDate,
            LocalDate endDate,
            Integer categoryId,
            Integer topN,
            String sortDirection,
            Integer page,
            Integer size
    ) {
        validateDateRange(startDate, endDate);
        validatePositiveOptional(categoryId);
        validateTopN(topN);
        String normalizedSortDirection = normalizeSortDirection(sortDirection);
        validatePageAndSize(page, size);

        List<MovieTypeRevenueResponse> rows = orderService.findRevenueByMovieType(
                OrderStatus.PAID,
                startDate.atStartOfDay(),
                toEndOfDay(endDate),
                categoryId
        );

        return buildRankingResponse(startDate, endDate, rows, topN, normalizedSortDirection, page, size);
    }

    @Transactional(readOnly = true)
    public RevenueRankingResponse<ComboRevenueResponse> getRevenueByCombo(
            LocalDate startDate,
            LocalDate endDate,
            Integer comboId,
            Integer topN,
            String sortDirection,
            Integer page,
            Integer size
    ) {
        validateDateRange(startDate, endDate);
        validatePositiveOptional(comboId);
        validateTopN(topN);
        String normalizedSortDirection = normalizeSortDirection(sortDirection);
        validatePageAndSize(page, size);

        List<ComboRevenueResponse> rows = orderService.findRevenueByCombo(
                OrderStatus.PAID,
                ComboDetailStatus.ACTIVE,
                startDate.atStartOfDay(),
                toEndOfDay(endDate),
                comboId
        );

        return buildRankingResponse(startDate, endDate, rows, topN, normalizedSortDirection, page, size);
    }

    @Transactional(readOnly = true)
    public OrderStatisticsResponse getOrderStatistics(
            LocalDate fromDate,
            LocalDate toDate,
            String status,
            Integer page,
            Integer size
    ) {
        validateDateRange(fromDate, toDate);
        validatePageAndSize(page, size);
        OrderStatus parsedStatus = parseOrderStatusNullable(status);

        LocalDateTime startAt = fromDate.atStartOfDay();
        LocalDateTime endAt = toEndOfDay(toDate);

        Pageable pageable = PageRequest.of(page - 1, size);
        Page<OrderStatisticItemResponse> orderPage = orderService.findOrderStatistics(
                startAt,
                endAt,
                parsedStatus,
                TicketStatus.ACTIVE,
                pageable
        );

        BigDecimal totalAmount = orderService.sumTotalAmountByCreatedAtRangeAndStatus(
                startAt,
                endAt,
                parsedStatus
        );

        return OrderStatisticsResponse.builder()
                .fromDate(fromDate)
                .toDate(toDate)
                .status(parsedStatus)
                .totalAmount(totalAmount == null ? BigDecimal.ZERO : totalAmount)
                .items(orderPage.getContent())
                .totalItems(orderPage.getTotalElements())
                .currentPage(orderPage.getNumber() + 1)
                .pageSize(orderPage.getSize())
                .totalPages(Math.max(1, orderPage.getTotalPages()))
                .build();
    }

    private <T extends RevenueValue> RevenueRankingResponse<T> buildRankingResponse(
            LocalDate startDate,
            LocalDate endDate,
            List<T> rows,
            Integer topN,
            String sortDirection,
            int page,
            int size
    ) {
        List<T> safeRows = rows == null ? List.of() : rows;
        List<T> sortedRows = new ArrayList<>(safeRows);
        sortedRows.sort((left, right) -> {
            BigDecimal leftRevenue = left.getRevenue() == null ? BigDecimal.ZERO : left.getRevenue();
            BigDecimal rightRevenue = right.getRevenue() == null ? BigDecimal.ZERO : right.getRevenue();
            int compare = leftRevenue.compareTo(rightRevenue);
            return SORT_ASC.equals(sortDirection) ? compare : -compare;
        });

        int totalItemsInt = sortedRows.size();
        long totalItems = totalItemsInt;
        int totalPages = totalItemsInt == 0 ? 1 : (int) Math.ceil((double) totalItemsInt / size);

        int fromIndex = (page - 1) * size;
        List<T> pagedItems;
        if (fromIndex >= totalItemsInt) {
            pagedItems = List.of();
        } else {
            int toIndex = Math.min(fromIndex + size, totalItemsInt);
            pagedItems = sortedRows.subList(fromIndex, toIndex);
        }

        BigDecimal totalRevenue = safeRows.stream()
                .map(item -> item.getRevenue() == null ? BigDecimal.ZERO : item.getRevenue())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int limit = topN == null ? totalItemsInt : Math.min(topN, totalItemsInt);
        List<T> chartItems = new ArrayList<>(sortedRows.subList(0, limit));

        return new RevenueRankingResponse<>(
                startDate,
                endDate,
                totalRevenue,
                topN,
                sortDirection,
                chartItems,
                pagedItems,
                totalItems,
                page,
                size,
                totalPages
        );
    }

    private LocalDateTime toEndOfDay(LocalDate date) {
        return date.plusDays(1).atStartOfDay().minusNanos(1);
    }

    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null || startDate.isAfter(endDate)) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
    }

    private void validatePositiveOptional(Integer value) {
        if (value != null && value < 1) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
    }

    private void validateTopN(Integer topN) {
        if (topN != null && topN < 1) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
    }

    private String normalizeSortDirection(String sortDirection) {
        if (sortDirection == null || sortDirection.isBlank()) {
            return SORT_DESC;
        }

        String normalized = sortDirection.trim().toUpperCase(Locale.ROOT);
        if (!SORT_ASC.equals(normalized) && !SORT_DESC.equals(normalized)) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        return normalized;
    }

    private OrderStatus parseOrderStatusNullable(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }

        try {
            return OrderStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
        } catch (Exception ex) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
    }

    private void validatePageAndSize(int page, int size) {
        if (page < 1) {
            throw new AppException(ErrorCode.INVALID_PAGE_NUMBER);
        }
        if (size < 1 || size > 100) {
            throw new AppException(ErrorCode.INVALID_PAGE_SIZE);
        }
    }
}
