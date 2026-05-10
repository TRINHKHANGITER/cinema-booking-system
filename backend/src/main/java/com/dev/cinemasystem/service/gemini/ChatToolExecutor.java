package com.dev.cinemasystem.service.gemini;

import com.dev.cinemasystem.dto.apiDTO.ItemListDto;
import com.dev.cinemasystem.enums.CinemaStatus;
import com.dev.cinemasystem.enums.MovieStatus;
import com.dev.cinemasystem.enums.MovieTypeStatus;
import com.dev.cinemasystem.enums.ShowTimeStatus;
import com.dev.cinemasystem.enums.SortDirection;
import com.dev.cinemasystem.service.CinemaService;
import com.dev.cinemasystem.service.MovieService;
import com.dev.cinemasystem.service.MovieTypeService;
import com.dev.cinemasystem.service.ShowTimeService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Map;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatToolExecutor {

    MovieTypeService movieTypeService;
    MovieService movieService;
    ShowTimeService showTimeService;
    CinemaService cinemaService;

    public ToolExecutionResult execute(String toolName, Map<String, Object> args) {
        return switch (toolName) {
            case "get_movie_types" -> executeGetMovieTypes();
            case "search_movies" -> executeSearchMovies(args);
            case "get_movie_detail" -> executeGetMovieDetail(args);
            case "get_showtimes" -> executeGetShowtimes(args);
            case "get_cinemas" -> executeGetCinemas(args);
            default -> new ToolExecutionResult("error", Map.of("message", "Unknown tool: " + toolName));
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

        LocalDate releaseDate = null;
        if (dateRaw != null && !dateRaw.isBlank()) {
            releaseDate = LocalDate.parse(dateRaw);
        }

        var result = showTimeService.getShowTimesByFilters(
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
        var result = cinemaService.getCinemas(provinceId, false, CinemaStatus.ACTIVE);
        return new ToolExecutionResult(
                "cinema_list",
                ItemListDto.<com.dev.cinemasystem.dto.cinemaDTO.CinemaResponse>builder()
                        .items(result)
                        .build()
        );
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