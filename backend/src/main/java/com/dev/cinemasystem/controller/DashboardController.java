package com.dev.cinemasystem.controller;

import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.dashboardDTO.CinemaRevenueResponse;
import com.dev.cinemasystem.dto.dashboardDTO.ComboRevenueResponse;
import com.dev.cinemasystem.dto.dashboardDTO.DashboardOverviewResponse;
import com.dev.cinemasystem.dto.dashboardDTO.MovieRevenueResponse;
import com.dev.cinemasystem.dto.dashboardDTO.MovieTypeRevenueResponse;
import com.dev.cinemasystem.dto.dashboardDTO.OrderStatisticsResponse;
import com.dev.cinemasystem.dto.dashboardDTO.RevenueRankingResponse;
import com.dev.cinemasystem.service.DashboardService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DashboardController {
    DashboardService dashboardService;

    @GetMapping("/overview")
    public ApiResponse<DashboardOverviewResponse> getOverview(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ApiResponse.<DashboardOverviewResponse>builder()
                .message("Lấy dữ liệu tổng quan dashboard thành công")
                .result(dashboardService.getOverview(startDate, endDate))
                .build();
    }

    @GetMapping("/customers/count")
    public ApiResponse<Long> getCustomerCount() {
        return ApiResponse.<Long>builder()
                .message("Lấy tổng số khách hàng thành công")
                .result(dashboardService.getCustomerCount())
                .build();
    }

    @GetMapping("/movies/count")
    public ApiResponse<Long> getMovieCount() {
        return ApiResponse.<Long>builder()
                .message("Lấy tổng số phim thành công")
                .result(dashboardService.getMovieCount())
                .build();
    }

    @GetMapping("/cinemas/count")
    public ApiResponse<Long> getCinemaCount() {
        return ApiResponse.<Long>builder()
                .message("Lấy tổng số rạp thành công")
                .result(dashboardService.getCinemaCount())
                .build();
    }

    @GetMapping("/revenue/cinemas")
    public ApiResponse<RevenueRankingResponse<CinemaRevenueResponse>> getRevenueByCinemas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Integer provinceId,
            @RequestParam(required = false) Integer cinemaId,
            @RequestParam(required = false) Integer n,
            @RequestParam(defaultValue = "DESC") String sort,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        return ApiResponse.<RevenueRankingResponse<CinemaRevenueResponse>>builder()
                .message("Lấy doanh thu theo rạp thành công")
                .result(dashboardService.getRevenueByCinema(
                        startDate,
                        endDate,
                        provinceId,
                        cinemaId,
                        n,
                        sort,
                        page,
                        size
                ))
                .build();
    }

    @GetMapping("/revenue/movies")
    public ApiResponse<RevenueRankingResponse<MovieRevenueResponse>> getRevenueByMovies(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Integer movieId,
            @RequestParam(required = false) Integer n,
            @RequestParam(defaultValue = "DESC") String sort,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        return ApiResponse.<RevenueRankingResponse<MovieRevenueResponse>>builder()
                .message("Lấy doanh thu theo phim thành công")
                .result(dashboardService.getRevenueByMovie(
                        startDate,
                        endDate,
                        movieId,
                        n,
                        sort,
                        page,
                        size
                ))
                .build();
    }

    @GetMapping("/revenue/movie-types")
    public ApiResponse<RevenueRankingResponse<MovieTypeRevenueResponse>> getRevenueByMovieTypes(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Integer n,
            @RequestParam(defaultValue = "DESC") String sort,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        return ApiResponse.<RevenueRankingResponse<MovieTypeRevenueResponse>>builder()
                .message("Lấy doanh thu theo thể loại phim thành công")
                .result(dashboardService.getRevenueByMovieType(
                        startDate,
                        endDate,
                        categoryId,
                        n,
                        sort,
                        page,
                        size
                ))
                .build();
    }

    @GetMapping("/revenue/combos")
    public ApiResponse<RevenueRankingResponse<ComboRevenueResponse>> getRevenueByCombos(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Integer comboId,
            @RequestParam(required = false) Integer n,
            @RequestParam(defaultValue = "DESC") String sort,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        return ApiResponse.<RevenueRankingResponse<ComboRevenueResponse>>builder()
                .message("Lấy doanh thu theo combo thành công")
                .result(dashboardService.getRevenueByCombo(
                        startDate,
                        endDate,
                        comboId,
                        n,
                        sort,
                        page,
                        size
                ))
                .build();
    }

    @GetMapping("/orders/statistics")
    public ApiResponse<OrderStatisticsResponse> getOrderStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        return ApiResponse.<OrderStatisticsResponse>builder()
                .message("Lấy thống kê đơn hàng thành công")
                .result(dashboardService.getOrderStatistics(fromDate, toDate, status, page, size))
                .build();
    }
}
