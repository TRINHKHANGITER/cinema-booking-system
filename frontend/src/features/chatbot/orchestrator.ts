import type { Movie } from "../../types/movie";
import type { ShowtimeMovieResponse, ShowtimeSearchItem } from "../../types/showtime";
import { formatTime } from "../../utils/utils";
import { FALLBACK_MESSAGE, GENRE_ALIASES, ROMANTIC_GENRE_PRIORITY } from "./constants";
import { parseChatIntent } from "./parser";
import { ChatbotServiceAdapter } from "./serviceAdapter";
import { addDays, normalizeText, toYyyyMmDd, truncateText, uniqueBy } from "./text";
import type {
    BotMessageDraft,
    ChatGenreTag,
    ChatIntentEntities,
    ChatMovieCard,
    ChatShowtimeCard,
    DateTarget,
} from "./types";

type MovieSearchContext = {
    movieId: number;
    movieName: string;
    movieTypeName: string | null;
    movie: Movie | null;
    showtimes: ShowtimeSearchItem[];
};

const scoreMovieName = (movieName: string, keyword: string): number => {
    const normalizedMovieName = normalizeText(movieName);
    const normalizedKeyword = normalizeText(keyword);

    if (!normalizedMovieName || !normalizedKeyword) return 0;
    if (normalizedMovieName === normalizedKeyword) return 100;
    if (normalizedMovieName.startsWith(normalizedKeyword)) return 90;
    if (normalizedMovieName.includes(normalizedKeyword)) return 80;

    const keywordParts = normalizedKeyword.split(" ").filter(Boolean);
    const matchedParts = keywordParts.filter((part) => normalizedMovieName.includes(part));

    return Math.floor((matchedParts.length / Math.max(keywordParts.length, 1)) * 60);
};

export class ChatbotOrchestrator {
    private readonly adapter: ChatbotServiceAdapter;

    constructor(adapter?: ChatbotServiceAdapter) {
        this.adapter = adapter ?? new ChatbotServiceAdapter();
    }

    async handleUserMessage(rawInput: string): Promise<BotMessageDraft[]> {
        const parsed = parseChatIntent(rawInput);

        switch (parsed.intent) {
            case "movies_on_date":
                return this.handleMoviesOnExplicitDate(parsed.entities);
            case "movies_today":
                return this.handleMoviesByDate("today", parsed.entities);
            case "movies_tomorrow":
                return this.handleMoviesByDate("tomorrow", parsed.entities);
            case "genres_list":
                return this.handleGenresList();
            case "movies_by_genre":
                return this.handleMoviesByGenre(parsed.entities);
            case "movie_info":
                return this.handleMovieInfo(parsed.entities);
            case "movie_showtimes":
                return this.handleMovieShowtimes(parsed.entities);
            case "similar_movie":
                return this.handleSimilarMovie(parsed.entities);
            case "movies_by_genre_after_time":
                return this.handleMoviesByGenreAfterTime(parsed.entities);
            case "romantic_tonight":
                return this.handleRomanticTonight(parsed.entities);
            default:
                return this.handleUnknownIntent();
        }
    }

    private async handleMoviesByDate(
        dateTarget: DateTarget,
        entities: ChatIntentEntities
    ): Promise<BotMessageDraft[]> {
        const date = this.getDateByTarget(dateTarget);
        const movies = await this.adapter.getScheduledMoviesByDate(date);
        const uniqueMovies = uniqueBy(movies, (movie) => movie.movieId);
        const timeAfter = entities.timeAfter;

        const filteredMovies =
            timeAfter !== undefined
                ? uniqueMovies.filter((movie) => this.movieHasShowtimeAfter(movie, timeAfter))
                : uniqueMovies;

        if (filteredMovies.length === 0) {
            const timeSuffix = timeAfter ? ` sau ${timeAfter}` : "";
            return [
                {
                    type: "text",
                    content: `Hiện chưa có phim${timeSuffix} cho ${this.getDateLabel(dateTarget)}.`,
                },
            ];
        }

        return [
            {
                type: "movie_list",
                content: `Danh sách phim chiếu ${this.getDateLabel(dateTarget)}:`,
                payload: {
                    movies: filteredMovies.slice(0, 10).map((movie) => this.toMovieCard(movie)),
                },
            },
        ];
    }

    private async handleMoviesOnExplicitDate(
        entities: ChatIntentEntities
    ): Promise<BotMessageDraft[]> {
        const explicitDate = entities.explicitDate;
        if (!explicitDate) {
            return this.handleUnknownIntent();
        }

        const dateLabel = this.formatIsoDateLabel(explicitDate);
        const movies = await this.adapter.getScheduledMoviesByDate(explicitDate);
        const uniqueMovies = uniqueBy(movies, (movie) => movie.movieId);
        const timeAfter = entities.timeAfter;

        const filteredMovies =
            timeAfter !== undefined
                ? uniqueMovies.filter((movie) => this.movieHasShowtimeAfter(movie, timeAfter))
                : uniqueMovies;

        if (filteredMovies.length === 0) {
            const timeSuffix = timeAfter ? ` sau ${timeAfter}` : "";
            return [
                {
                    type: "text",
                    content: `Ngay ${dateLabel} hien chua co phim${timeSuffix}.`,
                },
            ];
        }

        return [
            {
                type: "movie_list",
                content: `Danh sach phim chieu ngay ${dateLabel}:`,
                payload: {
                    movies: filteredMovies.slice(0, 10).map((movie) => this.toMovieCard(movie)),
                },
            },
        ];
    }

    private async handleGenresList(): Promise<BotMessageDraft[]> {
        const genres = await this.adapter.getGenreCatalog();

        if (genres.length === 0) {
            return [
                {
                    type: "text",
                    content: "Mình chưa lấy được danh sách thể loại phim lúc này.",
                },
            ];
        }

        return [
            {
                type: "genre_list",
                content: "Day la cac the loai phim dang co suat chieu:",
                payload: {
                    genres,
                },
            },
        ];
    }

    private async handleMoviesByGenre(entities: ChatIntentEntities): Promise<BotMessageDraft[]> {
        const genre = await this.resolveGenre(entities.genreKey);
        if (!genre) {
            return [
                {
                    type: "text",
                    content: "Minh chua xac dinh duoc the loai ban muon tim.",
                },
            ];
        }

        const dateQuery = this.resolveDateQuery(entities);
        const movies = await this.adapter.getMoviesByFilters({
            movieTypeId: genre.genreId ?? undefined,
            releaseDate: dateQuery?.isoDate,
            releaseDateCondition: "EQ",
            status: "SCHEDULED",
            page: 1,
            size: 200,
            sortBy: "startTime",
            direction: "ASC",
        });

        let filteredMovies = uniqueBy(movies, (movie) => movie.movieId);

        if (genre.genreId === null) {
            filteredMovies = filteredMovies.filter((movie) =>
                this.isGenreNameMatched(movie.movieType?.movieTypeName, entities.genreKey)
            );
        }

        if (entities.timeAfter) {
            filteredMovies = filteredMovies.filter((movie) =>
                this.movieHasShowtimeAfter(movie, entities.timeAfter ?? "00:00")
            );
        }

        if (filteredMovies.length === 0) {
            const dateLabel = dateQuery ? ` vao ${dateQuery.label}` : "";
            return [
                {
                    type: "text",
                    content: `Khong tim thay phim the loai ${genre.genreName}${dateLabel}.`,
                },
            ];
        }

        return [
            {
                type: "movie_list",
                content: `Phim the loai ${genre.genreName}${dateQuery ? ` (${dateQuery.label})` : ""}:`,
                payload: {
                    movies: filteredMovies.slice(0, 10).map((movie) => this.toMovieCard(movie)),
                },
            },
        ];
    }

    private async handleMovieInfo(entities: ChatIntentEntities): Promise<BotMessageDraft[]> {
        const keyword = entities.movieName?.trim();
        if (!keyword) {
            return [
                {
                    type: "text",
                    content: "Ban hay gui theo mau: 'Thong tin phim Conan'.",
                },
            ];
        }

        const context = await this.findMovieContextByKeyword(keyword);
        if (!context) {
            return [
                {
                    type: "text",
                    content: `Minh chua tim thay phim '${keyword}'.`,
                },
            ];
        }

        return [
            {
                type: "movie_list",
                content: `Thong tin phim ${context.movieName}:`,
                payload: {
                    movies: [this.toMovieCardFromContext(context)],
                },
            },
        ];
    }

    private async handleMovieShowtimes(entities: ChatIntentEntities): Promise<BotMessageDraft[]> {
        const keyword = entities.movieName?.trim();
        if (!keyword) {
            return [
                {
                    type: "text",
                    content: "Ban hay gui theo mau: 'Phim Conan chieu luc may gio'.",
                },
            ];
        }

        const context = await this.findMovieContextByKeyword(keyword);
        if (!context) {
            return [
                {
                    type: "text",
                    content: `Minh chua tim thay lich chieu cho phim '${keyword}'.`,
                },
            ];
        }

        let showtimes = this.sortShowtimes(context.showtimes);

        const explicitDate = entities.explicitDate;
        const dateTarget = entities.dateTarget;
        if (explicitDate) {
            showtimes = showtimes.filter((showtime) =>
                this.matchIsoDate(showtime.startTime, explicitDate)
            );
        } else if (dateTarget) {
            showtimes = showtimes.filter((showtime) =>
                this.matchDateTarget(showtime.startTime, dateTarget)
            );
        }

        if (entities.timeAfter) {
            showtimes = showtimes.filter((showtime) =>
                this.isTimeAfter(showtime.startTime, entities.timeAfter ?? "00:00")
            );
        }

        if (showtimes.length === 0) {
            return [
                {
                    type: "text",
                    content: `Phim ${context.movieName} hien chua co suat chieu phu hop dieu kien ban can.`,
                },
            ];
        }

        const botMessages: BotMessageDraft[] = [];
        if (context.movie) {
            botMessages.push({
                type: "movie_list",
                content: `Thong tin nhanh phim ${context.movieName}:`,
                payload: {
                    movies: [this.toMovieCard(context.movie)],
                },
            });
        }

        botMessages.push({
            type: "showtime_list",
            content: `Lich chieu phim ${context.movieName}:`,
            payload: {
                showtimes: showtimes
                    .slice(0, 24)
                    .map((showtime) => this.toShowtimeCard(showtime, dateTarget)),
            },
        });

        return botMessages;
    }

    private async handleSimilarMovie(entities: ChatIntentEntities): Promise<BotMessageDraft[]> {
        const keyword = entities.movieName?.trim();
        if (!keyword) {
            return [
                {
                    type: "text",
                    content: "Ban hay noi ro ten phim mau: 'Co phim nao giong Conan khong?'.",
                },
            ];
        }

        const context = await this.findMovieContextByKeyword(keyword);
        if (!context) {
            return [
                {
                    type: "text",
                    content: `Minh chua tim thay phim '${keyword}' de goi y phim tuong tu.`,
                },
            ];
        }

        const targetGenreId = context.movie?.movieType?.movieTypeId ?? null;
        const targetGenreName = context.movie?.movieType?.movieTypeName ?? context.movieTypeName;

        if (!targetGenreName) {
            return [
                {
                    type: "text",
                    content: `Minh chua co du du lieu the loai cua phim ${context.movieName} de goi y.`,
                },
            ];
        }

        const candidates = await this.adapter.getMoviesByFilters({
            movieTypeId: targetGenreId ?? undefined,
            status: "SCHEDULED",
            page: 1,
            size: 200,
            sortBy: "startTime",
            direction: "ASC",
        });

        let filtered = uniqueBy(candidates, (movie) => movie.movieId).filter(
            (movie) => movie.movieId !== context.movieId
        );

        if (targetGenreId === null) {
            filtered = filtered.filter((movie) =>
                this.isGenreNameMatched(movie.movieType?.movieTypeName, targetGenreName)
            );
        }

        if (filtered.length === 0) {
            return [
                {
                    type: "text",
                    content: `Chua co phim nao cung gu voi ${context.movieName} trong he thong hien tai.`,
                },
            ];
        }

        return [
            {
                type: "suggestion",
                content: `Phim co vibe giong ${context.movieName}:`,
                payload: {
                    reason: `Minh goi y theo the loai gan voi '${targetGenreName}'.`,
                    movies: filtered.slice(0, 6).map((movie) => this.toMovieCard(movie)),
                },
            },
        ];
    }

    private async handleMoviesByGenreAfterTime(
        entities: ChatIntentEntities
    ): Promise<BotMessageDraft[]> {
        const genre = await this.resolveGenre(entities.genreKey);
        if (!genre) {
            return [
                {
                    type: "text",
                    content: "Minh chua xac dinh duoc the loai can loc theo gio.",
                },
            ];
        }

        const dateQuery = this.resolveDateQuery(entities, "today");
        if (!dateQuery) {
            return this.handleUnknownIntent();
        }

        const timeAfter = entities.timeAfter ?? "19:00";

        const showtimes = await this.adapter.searchShowtimes({
            movieTypeId: genre.genreId ?? undefined,
            dateFrom: dateQuery.isoDate,
            dateTo: dateQuery.isoDate,
            timeFrom: timeAfter,
            page: 1,
            size: 200,
        });

        let filteredShowtimes = showtimes;
        if (genre.genreId === null) {
            filteredShowtimes = filteredShowtimes.filter((showtime) =>
                this.isGenreNameMatched(showtime.movieTypeName, entities.genreKey)
            );
        }

        if (filteredShowtimes.length === 0) {
            return [
                {
                    type: "text",
                    content: `Khong co phim ${genre.genreName} chieu sau ${timeAfter} vao ${dateQuery.label}.`,
                },
            ];
        }

        const sortedShowtimes = this.sortShowtimes(filteredShowtimes);
        const movieIds = uniqueBy(
            sortedShowtimes.map((showtime) => showtime.movieId),
            (movieId) => movieId
        );
        const movieDetails = await this.adapter.getMoviesByIds(movieIds.slice(0, 10));
        const movieDetailMap = new Map(movieDetails.map((movie) => [movie.movieId, movie]));

        const movieCards = movieIds
            .slice(0, 10)
            .map((movieId) => {
                const movie = movieDetailMap.get(movieId);
                if (movie) {
                    return this.toMovieCard(movie);
                }

                const fallback = sortedShowtimes.find((item) => item.movieId === movieId);
                if (!fallback) {
                    return null;
                }

                return this.toMovieCardFromShowtimeItem(fallback);
            })
            .filter((movie): movie is ChatMovieCard => movie !== null);

        return [
            {
                type: "movie_list",
                content: `Phim ${genre.genreName} chieu sau ${timeAfter} (${dateQuery.label}):`,
                payload: {
                    movies: movieCards,
                },
            },
            {
                type: "showtime_list",
                content: "Lich chieu chi tiet:",
                payload: {
                    showtimes: sortedShowtimes
                        .slice(0, 24)
                        .map((showtime) => this.toShowtimeCard(showtime, dateQuery.dateTarget)),
                },
            },
        ];
    }

    private async handleRomanticTonight(entities: ChatIntentEntities): Promise<BotMessageDraft[]> {
        const dateQuery = this.resolveDateQuery(entities, "today");
        if (!dateQuery) {
            return this.handleUnknownIntent();
        }

        const timeAfter = entities.timeAfter ?? "18:00";

        const showtimes = await this.adapter.searchShowtimes({
            dateFrom: dateQuery.isoDate,
            dateTo: dateQuery.isoDate,
            timeFrom: timeAfter,
            page: 1,
            size: 200,
        });

        if (showtimes.length === 0) {
            return [
                {
                    type: "text",
                    content: "Toi nay hien chua co suat chieu phu hop de minh goi y.",
                },
            ];
        }

        const preferredAliases = ROMANTIC_GENRE_PRIORITY.flatMap(
            (genreKey) => GENRE_ALIASES[genreKey] ?? [genreKey]
        );

        const preferredShowtimes = showtimes.filter((showtime) =>
            preferredAliases.some((alias) => this.isGenreNameMatched(showtime.movieTypeName, alias))
        );

        const sourceShowtimes = preferredShowtimes.length > 0 ? preferredShowtimes : showtimes;
        const sortedShowtimes = this.sortShowtimes(sourceShowtimes);

        const movieIds = uniqueBy(
            sortedShowtimes.map((showtime) => showtime.movieId),
            (movieId) => movieId
        );

        const movieDetails = await this.adapter.getMoviesByIds(movieIds.slice(0, 6));
        const movieDetailMap = new Map(movieDetails.map((movie) => [movie.movieId, movie]));

        const movieCards = movieIds
            .slice(0, 6)
            .map((movieId) => {
                const movie = movieDetailMap.get(movieId);
                if (movie) {
                    return this.toMovieCard(movie);
                }

                const fallback = sortedShowtimes.find((item) => item.movieId === movieId);
                if (!fallback) {
                    return null;
                }

                return this.toMovieCardFromShowtimeItem(fallback);
            })
            .filter((movie): movie is ChatMovieCard => movie !== null);

        const reason =
            preferredShowtimes.length > 0
                ? "Minh uu tien phim tinh cam, hai va gia dinh de buoi hen de chiu hon."
                : "He thong chua co nhieu phim dung gu, minh chon cac phim co suat toi nay de ban de chon.";

        return [
            {
                type: "suggestion",
                content: "Goi y phim cho buoi hen toi nay:",
                payload: {
                    reason,
                    movies: movieCards,
                },
            },
            {
                type: "showtime_list",
                content: `Suat chieu tu ${timeAfter}:`,
                payload: {
                    showtimes: sortedShowtimes
                        .slice(0, 20)
                        .map((showtime) => this.toShowtimeCard(showtime, dateQuery.dateTarget)),
                },
            },
        ];
    }

    private handleUnknownIntent(): BotMessageDraft[] {
        return [
            {
                type: "text",
                content: FALLBACK_MESSAGE,
            },
        ];
    }

    private async findMovieContextByKeyword(keyword: string): Promise<MovieSearchContext | null> {
        const showtimes = await this.adapter.searchShowtimes({
            keyword,
            page: 1,
            size: 200,
        });

        if (showtimes.length === 0) {
            return null;
        }

        const bestByMovieId = new Map<
            number,
            {
                movieId: number;
                movieName: string;
                movieTypeName: string | null;
                score: number;
            }
        >();

        for (const showtime of showtimes) {
            const score = scoreMovieName(showtime.movieName, keyword);
            const existing = bestByMovieId.get(showtime.movieId);
            if (!existing || score > existing.score) {
                bestByMovieId.set(showtime.movieId, {
                    movieId: showtime.movieId,
                    movieName: showtime.movieName,
                    movieTypeName: showtime.movieTypeName ?? null,
                    score,
                });
            }
        }

        const bestMatch = Array.from(bestByMovieId.values()).sort((a, b) => b.score - a.score)[0];
        if (!bestMatch) {
            return null;
        }

        let movie = await this.adapter.getMovieById(bestMatch.movieId);

        if (!movie) {
            const movieFromShowtime = await this.adapter.getMoviesByFilters({
                movieId: bestMatch.movieId,
                status: "SCHEDULED",
                page: 1,
                size: 1,
            });
            movie = movieFromShowtime[0] ?? null;
        }

        const showtimesByMovie = this.sortShowtimes(
            showtimes.filter((showtime) => showtime.movieId === bestMatch.movieId)
        );

        return {
            movieId: bestMatch.movieId,
            movieName: movie?.movieName ?? bestMatch.movieName,
            movieTypeName: movie?.movieType?.movieTypeName ?? bestMatch.movieTypeName,
            movie,
            showtimes: showtimesByMovie,
        };
    }

    private async resolveGenre(genreKey?: string): Promise<ChatGenreTag | null> {
        if (!genreKey) return null;

        const genres = await this.adapter.getGenreCatalog();
        if (genres.length === 0) return null;

        const aliases = GENRE_ALIASES[genreKey] ?? [genreKey];
        const normalizedAliases = uniqueBy(
            [...aliases, genreKey].map((alias) => normalizeText(alias)),
            (alias) => alias
        );

        let resolved: { genre: ChatGenreTag; score: number } | null = null;

        for (const genre of genres) {
            const normalizedGenreName = normalizeText(genre.genreName);
            let score = 0;

            for (const alias of normalizedAliases) {
                if (normalizedGenreName === alias) {
                    score = Math.max(score, 100);
                } else if (normalizedGenreName.includes(alias) || alias.includes(normalizedGenreName)) {
                    score = Math.max(score, 80);
                }
            }

            if (score === 0) continue;

            if (
                !resolved ||
                score > resolved.score ||
                (score === resolved.score && genre.usageCount > resolved.genre.usageCount)
            ) {
                resolved = { genre, score };
            }
        }

        return resolved?.genre ?? null;
    }

    private toMovieCard(movie: Movie | ShowtimeMovieResponse): ChatMovieCard {
        return {
            movieId: movie.movieId,
            movieName: movie.movieName,
            movieTypeName: movie.movieType?.movieTypeName ?? null,
            durationMinutes: movie.durationMinutes ?? null,
            description: truncateText(movie.description, 220) || null,
            imagePortrait: movie.imagePortrait ?? movie.imageLandscape ?? null,
            status: movie.status ?? null,
            minimumAge: movie.minimumAge ?? null,
            ratingAverage: movie.ratingAverage ?? null,
        };
    }

    private toMovieCardFromContext(context: MovieSearchContext): ChatMovieCard {
        if (context.movie) {
            return this.toMovieCard(context.movie);
        }

        return {
            movieId: context.movieId,
            movieName: context.movieName,
            movieTypeName: context.movieTypeName,
            durationMinutes: null,
            description: null,
            imagePortrait: null,
            status: null,
            minimumAge: null,
            ratingAverage: null,
        };
    }

    private toMovieCardFromShowtimeItem(showtime: ShowtimeSearchItem): ChatMovieCard {
        return {
            movieId: showtime.movieId,
            movieName: showtime.movieName,
            movieTypeName: showtime.movieTypeName,
            durationMinutes: null,
            description: null,
            imagePortrait: null,
            status: null,
            minimumAge: null,
            ratingAverage: null,
        };
    }

    private toShowtimeCard(
        showtime: ShowtimeSearchItem,
        fallbackDateTarget?: DateTarget
    ): ChatShowtimeCard {
        const parsedDate = new Date(showtime.startTime);

        const dateLabel = Number.isNaN(parsedDate.getTime())
            ? fallbackDateTarget
                ? this.getDateLabel(fallbackDateTarget)
                : "Khong ro ngay"
            : parsedDate.toLocaleDateString("vi-VN");

        return {
            showTimeId: showtime.showTimeId,
            movieId: showtime.movieId,
            movieName: showtime.movieName,
            movieTypeName: showtime.movieTypeName,
            startTime: showtime.startTime,
            endTime: showtime.endTime,
            dateLabel,
            timeLabel: formatTime(showtime.startTime),
            cinemaName: showtime.cinemaName ?? null,
            roomName: showtime.roomName ?? null,
            roomTypeName: showtime.roomTypeName ?? null,
        };
    }

    private sortShowtimes(showtimes: ShowtimeSearchItem[]): ShowtimeSearchItem[] {
        return [...showtimes].sort((a, b) => {
            const aTime = new Date(a.startTime).getTime();
            const bTime = new Date(b.startTime).getTime();

            if (!Number.isNaN(aTime) && !Number.isNaN(bTime)) {
                return aTime - bTime;
            }

            return a.startTime.localeCompare(b.startTime);
        });
    }

    private resolveDateQuery(
        entities: ChatIntentEntities,
        fallbackTarget?: DateTarget
    ): { isoDate: string; label: string; dateTarget?: DateTarget } | null {
        if (entities.explicitDate) {
            return {
                isoDate: entities.explicitDate,
                label: this.formatIsoDateLabel(entities.explicitDate),
            };
        }

        const target = entities.dateTarget ?? fallbackTarget;
        if (!target) {
            return null;
        }

        return {
            isoDate: this.getDateByTarget(target),
            label: this.getDateLabel(target),
            dateTarget: target,
        };
    }

    private formatIsoDateLabel(isoDate: string): string {
        const matched = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!matched) {
            return isoDate;
        }

        return `${matched[3]}/${matched[2]}/${matched[1]}`;
    }

    private getDateByTarget(target: DateTarget): string {
        const now = new Date();
        const date = target === "tomorrow" ? addDays(now, 1) : now;
        return toYyyyMmDd(date);
    }

    private getDateLabel(target: DateTarget): string {
        return target === "tomorrow" ? "ngay mai" : "hom nay";
    }

    private matchDateTarget(startTime: string, target: DateTarget): boolean {
        const parsed = new Date(startTime);
        if (Number.isNaN(parsed.getTime())) {
            return false;
        }

        const targetDate = this.getDateByTarget(target);
        return toYyyyMmDd(parsed) === targetDate;
    }

    private matchIsoDate(startTime: string, isoDate: string): boolean {
        const parsed = new Date(startTime);
        if (Number.isNaN(parsed.getTime())) {
            return false;
        }

        return toYyyyMmDd(parsed) === isoDate;
    }

    private movieHasShowtimeAfter(movie: ShowtimeMovieResponse, timeAfter: string): boolean {
        const showTimes = movie.showTimes ?? [];
        return showTimes.some((show) => this.isTimeAfter(show.startTime, timeAfter));
    }

    private isTimeAfter(timeValue: string, targetTime: string): boolean {
        const timeInMinutes = this.toMinutes(timeValue);
        const targetInMinutes = this.toMinutes(targetTime);

        if (timeInMinutes === null || targetInMinutes === null) {
            return false;
        }

        return timeInMinutes >= targetInMinutes;
    }

    private toMinutes(rawTime: string): number | null {
        const formatted = formatTime(rawTime);
        const match = formatted.match(/^(\d{2}):(\d{2})$/);
        if (!match) return null;

        const hour = Number(match[1]);
        const minute = Number(match[2]);

        if (Number.isNaN(hour) || Number.isNaN(minute)) {
            return null;
        }

        return hour * 60 + minute;
    }

    private isGenreNameMatched(genreName: string | null | undefined, genreKeyword?: string): boolean {
        if (!genreName || !genreKeyword) return false;

        const normalizedGenreName = normalizeText(genreName);
        const aliases = GENRE_ALIASES[genreKeyword] ?? [genreKeyword];

        return aliases.some((alias) => {
            const normalizedAlias = normalizeText(alias);
            return (
                normalizedGenreName === normalizedAlias ||
                normalizedGenreName.includes(normalizedAlias) ||
                normalizedAlias.includes(normalizedGenreName)
            );
        });
    }
}

export const createChatbotOrchestrator = (): ChatbotOrchestrator => {
    return new ChatbotOrchestrator();
};
