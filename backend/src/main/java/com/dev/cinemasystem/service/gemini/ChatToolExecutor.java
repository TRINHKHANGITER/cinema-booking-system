package com.dev.cinemasystem.service.gemini;

import com.dev.cinemasystem.dto.apiDTO.ItemListDto;
import com.dev.cinemasystem.dto.provinceDTO.ProvinceResponse;
import com.dev.cinemasystem.enums.CinemaStatus;
import com.dev.cinemasystem.enums.MovieStatus;
import com.dev.cinemasystem.enums.MovieTypeStatus;
import com.dev.cinemasystem.enums.PriceTicketStatus;
import com.dev.cinemasystem.enums.ProvinceStatus;
import com.dev.cinemasystem.enums.ShowTimeStatus;
import com.dev.cinemasystem.enums.SortDirection;
import com.dev.cinemasystem.service.CinemaService;
import com.dev.cinemasystem.service.MovieService;
import com.dev.cinemasystem.service.MovieTypeService;
import com.dev.cinemasystem.service.PriceTicketService;
import com.dev.cinemasystem.service.ProvinceService;
import com.dev.cinemasystem.service.ShowTimeService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatToolExecutor {

    MovieTypeService movieTypeService;
    MovieService movieService;
    ShowTimeService showTimeService;
    CinemaService cinemaService;
    ProvinceService provinceService;
    PriceTicketService priceTicketService;

    public ToolExecutionResult execute(String toolName, Map<String, Object> args) {
        return switch (toolName) {
            case "get_movie_types" -> executeGetMovieTypes();
            case "search_movies" -> executeSearchMovies(args);
            case "get_movie_detail" -> executeGetMovieDetail(args);
            case "get_showtimes" -> executeGetShowtimes(args);
            case "get_cinemas" -> executeGetCinemas(args);
            case "get_provinces" -> executeGetProvinces(args);
            case "get_price_tickets" -> executeGetPriceTickets(args);
            default -> new ToolExecutionResult("error", Map.of("message", "Tool không xác định: " + toolName));
        };
    }

    private ToolExecutionResult executeGetMovieTypes() {
        var items = movieTypeService.getMovieTypesForMovieDropdown(MovieTypeStatus.ACTIVE);
        return new ToolExecutionResult(
                "genre_list",
                ItemListDto.<com.dev.cinemasystem.dto.movieTypeDTO.MovieTypeResponse>builder()
                        .items(items)
                        .build()
        );
    }

    private ToolExecutionResult executeSearchMovies(Map<String, Object> args) {
        String keyword = asString(args.get("keyword"));
        var result = showTimeService.getShowTimesByFilters(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                keyword,
                null,
                ShowTimeStatus.SELLING,
                1,
                10,
                "showtime",
                SortDirection.ASC
        );
        return new ToolExecutionResult("showtime_list", result);
    }

    private ToolExecutionResult executeGetMovieDetail(Map<String, Object> args) {
        Integer movieId = asInteger(args.get("movieId"));
        var result = movieService.getMovieById(movieId, MovieStatus.ACTIVE);
        return new ToolExecutionResult("movie_detail", result);
    }

    private ToolExecutionResult executeGetShowtimes(Map<String, Object> args) {
        Integer movieId = asInteger(args.get("movieId"));
        Integer movieTypeId = asInteger(args.get("movieTypeId"));
        Integer provinceId = asInteger(args.get("provinceId"));
        Integer cinemaId = asInteger(args.get("cinemaId"));
        String movieName = asString(args.get("movieName"));
        String dateRaw = asString(args.get("date"));
        String provinceName = asString(args.get("provinceName"));

        // Nếu bot gửi provinceName thay vì provinceId, tự động tra cứu provinceId
        if (provinceId == null && provinceName != null && !provinceName.isBlank()) {
            provinceId = resolveProvinceIdByName(provinceName);
        }

        LocalDate releaseDate = null;
        if (dateRaw != null && !dateRaw.isBlank()) {
            releaseDate = LocalDate.parse(dateRaw);
        }

        var result = showTimeService.getShowTimesByFilters(
                null,
                provinceId,
                cinemaId,
                movieTypeId,
                releaseDate,
                releaseDate,
                null, null,
                movieName,
                movieId,
                ShowTimeStatus.SELLING,
                1,
                10,
                "showtime",
                SortDirection.ASC
        );

        return new ToolExecutionResult("showtime_list", result);
    }

    private ToolExecutionResult executeGetCinemas(Map<String, Object> args) {
        Integer provinceId = asInteger(args.get("provinceId"));
        String provinceName = asString(args.get("provinceName"));

        // Nếu bot gửi provinceName thay vì provinceId, tự động tra cứu provinceId
        if (provinceId == null && provinceName != null && !provinceName.isBlank()) {
            provinceId = resolveProvinceIdByName(provinceName);
        }

        var result = cinemaService.getCinemas(provinceId, false, CinemaStatus.ACTIVE);
        return new ToolExecutionResult(
                "cinema_list",
                ItemListDto.<com.dev.cinemasystem.dto.cinemaDTO.CinemaResponse>builder()
                        .items(result)
                        .build()
        );
    }

    private ToolExecutionResult executeGetProvinces(Map<String, Object> args) {
        String keyword = asString(args.get("keyword"));
        List<ProvinceResponse> provinces = provinceService.getProvinces(ProvinceStatus.ACTIVE);

        // Lọc theo từ khóa nếu có
        if (keyword != null && !keyword.isBlank()) {
            String kw = keyword.trim().toLowerCase();
            provinces = provinces.stream()
                    .filter(p -> p.getProvinceName().toLowerCase().contains(kw))
                    .toList();
        }

        return new ToolExecutionResult(
                "province_list",
                ItemListDto.<ProvinceResponse>builder()
                        .items(provinces)
                        .build()
        );
    }

    private ToolExecutionResult executeGetPriceTickets(Map<String, Object> args) {
        Integer roomTypeId = asInteger(args.get("roomTypeId"));
        Integer seatTypeId = asInteger(args.get("seatTypeId"));

        var allPrices = priceTicketService.getPriceTickets();

        // Lọc theo roomTypeId và seatTypeId nếu có truyền vào
        var filtered = allPrices.stream()
                .filter(p -> {
                    boolean matchRoom = (roomTypeId == null)
                            || (p.getRoomType() != null && roomTypeId.equals(p.getRoomType().getRoomTypeId()));
                    boolean matchSeat = (seatTypeId == null)
                            || (p.getSeatType() != null && seatTypeId.equals(p.getSeatType().getSeatTypeId()));
                    return matchRoom && matchSeat;
                })
                .filter(p -> p.getStatus() == PriceTicketStatus.ACTIVE)
                .toList();

        return new ToolExecutionResult(
                "price_ticket_list",
                ItemListDto.<com.dev.cinemasystem.dto.priceTicketDTO.PriceTicketResponse>builder()
                        .items(filtered)
                        .build()
        );
    }

    /**
     * Tìm provinceId từ tên tỉnh. So sánh mềm (contains, case-insensitive).
     * Trả về null nếu không tìm thấy.
     */
    private Integer resolveProvinceIdByName(String provinceName) {
        if (provinceName == null || provinceName.isBlank()) return null;
        String kw = provinceName.trim().toLowerCase();
        return provinceService.getProvinces(ProvinceStatus.ACTIVE).stream()
                .filter(p -> p.getProvinceName().toLowerCase().contains(kw)
                        || kw.contains(p.getProvinceName().toLowerCase()))
                .findFirst()
                .map(ProvinceResponse::getProvinceId)
                .orElse(null);
    }

    private Integer asInteger(Object value) {
        if (value == null) return null;
        if (value instanceof Number n) return n.intValue();
        return Integer.parseInt(value.toString());
    }

    private String asString(Object value) {
        return value == null ? null : value.toString();
    }
}
