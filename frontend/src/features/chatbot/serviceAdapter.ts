import { movieService } from "../../services/movie.service";
import { showTimeService } from "../../services/showtimeService";
import type { ApiResponse, PagingDto } from "../../types/api";
import type { Movie } from "../../types/movie";
import type {
    ShowTimeSearchRequest,
    ShowTimeStatus,
    ShowtimeMovieResponse,
    ShowtimeSearchItem,
} from "../../types/showtime";
import { uniqueBy } from "./text";
import type { ChatGenreTag } from "./types";

type ShowTimeSortDirection = "ASC" | "DESC";
type ReleaseDateCondition = "EQ" | "GT" | "GTE";

type MovieFilterParams = {
    provinceId?: number;
    cinemaId?: number;
    movieTypeId?: number;
    releaseDate?: string;
    releaseDateCondition?: ReleaseDateCondition;
    name?: string;
    movieId?: number;
    status?: ShowTimeStatus;
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: ShowTimeSortDirection;
};

const SUCCESS_CODE = "SUCCESS";
const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 200;
const GENRE_CACHE_TTL = 5 * 60 * 1000;

const getPagingItems = <T>(
    response: ApiResponse<PagingDto<T>>,
    fallbackMessage: string
): T[] => {
    if (response.code !== SUCCESS_CODE) {
        throw new Error(response.message || fallbackMessage);
    }

    return response.result?.items ?? [];
};

export class ChatbotServiceAdapter {
    private genreCache: ChatGenreTag[] | null = null;
    private genreCacheExpiresAt = 0;

    async getMoviesByFilters(params: MovieFilterParams = {}): Promise<ShowtimeMovieResponse[]> {
        const response = await showTimeService.getShowTimesByFilters({
            provinceId: params.provinceId,
            cinemaId: params.cinemaId,
            movieTypeId: params.movieTypeId,
            releaseDate: params.releaseDate,
            releaseDateCondition: params.releaseDateCondition ?? "EQ",
            name: params.name,
            movieId: params.movieId,
            status: params.status ?? "SCHEDULED",
            page: params.page ?? DEFAULT_PAGE,
            size: params.size ?? DEFAULT_SIZE,
            sortBy: params.sortBy ?? "startTime",
            direction: params.direction ?? "ASC",
        });

        return getPagingItems(response, "Khong the lay danh sach phim tu he thong.");
    }

    async getScheduledMoviesByDate(date: string): Promise<ShowtimeMovieResponse[]> {
        return this.getMoviesByFilters({
            releaseDate: date,
            releaseDateCondition: "EQ",
            status: "SCHEDULED",
            page: DEFAULT_PAGE,
            size: DEFAULT_SIZE,
            sortBy: "startTime",
            direction: "ASC",
        });
    }

    async searchShowtimes(params: ShowTimeSearchRequest): Promise<ShowtimeSearchItem[]> {
        const response = await showTimeService.searchShowTimes({
            ...params,
            page: params.page ?? DEFAULT_PAGE,
            size: params.size ?? DEFAULT_SIZE,
        });

        return getPagingItems(response, "Khong the lay lich chieu tu he thong.");
    }

    async getMovieById(movieId: number): Promise<Movie | null> {
        try {
            const response = await movieService.getMovieByIdAndStatus(movieId, "ACTIVE");
            if (response.code !== SUCCESS_CODE) {
                return null;
            }

            return response.result;
        } catch {
            return null;
        }
    }

    async getMoviesByIds(movieIds: number[]): Promise<Movie[]> {
        const uniqueMovieIds = uniqueBy(movieIds, (item) => item);

        const settled = await Promise.allSettled(
            uniqueMovieIds.map((movieId) => this.getMovieById(movieId))
        );

        const movies: Movie[] = [];

        for (const item of settled) {
            if (item.status === "fulfilled" && item.value) {
                movies.push(item.value);
            }
        }

        return movies;
    }

    async getGenreCatalog(forceRefresh = false): Promise<ChatGenreTag[]> {
        const now = Date.now();
        if (!forceRefresh && this.genreCache && now < this.genreCacheExpiresAt) {
            return this.genreCache;
        }

        const movies = await this.getMoviesByFilters({
            status: "SCHEDULED",
            page: 1,
            size: 300,
            sortBy: "startTime",
            direction: "ASC",
        });

        const uniqueMovies = uniqueBy(movies, (movie) => movie.movieId);
        const genreMap = new Map<string, ChatGenreTag>();

        for (const movie of uniqueMovies) {
            const genreId = movie.movieType?.movieTypeId ?? null;
            const genreName = movie.movieType?.movieTypeName?.trim();

            if (!genreName) continue;

            const key = genreId !== null ? `id:${genreId}` : `name:${genreName.toLowerCase()}`;
            const existing = genreMap.get(key);

            if (existing) {
                existing.usageCount += 1;
                continue;
            }

            genreMap.set(key, {
                genreId,
                genreName,
                usageCount: 1,
            });
        }

        let genres = Array.from(genreMap.values()).sort((a, b) => {
            if (b.usageCount !== a.usageCount) {
                return b.usageCount - a.usageCount;
            }

            return a.genreName.localeCompare(b.genreName);
        });

        if (genres.length === 0) {
            const showtimes = await this.searchShowtimes({ page: 1, size: 300 });
            const fallbackMap = new Map<string, ChatGenreTag>();

            for (const showtime of showtimes) {
                const genreName = showtime.movieTypeName?.trim();
                if (!genreName) continue;

                const key = genreName.toLowerCase();
                const existing = fallbackMap.get(key);

                if (existing) {
                    existing.usageCount += 1;
                    continue;
                }

                fallbackMap.set(key, {
                    genreId: null,
                    genreName,
                    usageCount: 1,
                });
            }

            genres = Array.from(fallbackMap.values()).sort((a, b) => b.usageCount - a.usageCount);
        }

        this.genreCache = genres;
        this.genreCacheExpiresAt = now + GENRE_CACHE_TTL;

        return genres;
    }
}
