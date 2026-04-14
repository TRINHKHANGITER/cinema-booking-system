import api from "../lib/axios";
import type { ApiResponse, PagingDto } from "../types/api";
import type {
    Movie,
    MovieCreationRequest,
    MovieStatus,
    MovieUpdateRequest,
} from "../types/movie";

type MovieListParams = {
    cinemaId?: number;
    movieTypeId?: number;
    status?: MovieStatus;
    page?: number;
    size?: number;
};

const appendIfDefined = (form: FormData, key: string, value: unknown) => {
    if (value === undefined || value === null) return;
    form.append(key, String(value));
};

const toMovieFormData = (request: MovieCreationRequest | MovieUpdateRequest) => {
    const form = new FormData();

    appendIfDefined(form, "movieName", request.movieName);
    appendIfDefined(form, "description", request.description);
    appendIfDefined(form, "durationMinutes", request.durationMinutes);
    appendIfDefined(form, "movieTypeId", request.movieTypeId);
    appendIfDefined(form, "slug", request.slug);
    appendIfDefined(form, "minimumAge", request.minimumAge);
    appendIfDefined(form, "imageLandscape", request.imageLandscape);
    appendIfDefined(form, "imagePortrait", request.imagePortrait);
    appendIfDefined(form, "trailerUrl", request.trailerUrl);
    appendIfDefined(form, "ratingAverage", request.ratingAverage);
    appendIfDefined(form, "totalVotes", request.totalVotes);
    appendIfDefined(form, "releaseDate", request.releaseDate);
    appendIfDefined(form, "endDate", request.endDate);
    appendIfDefined(form, "country", request.country);
    appendIfDefined(form, "producer", request.producer);
    appendIfDefined(form, "director", request.director);
    appendIfDefined(form, "actors", request.actors);

    return form;
};

export const movieService = {
    getMovieByIdAndStatus: async (movieId: number, status: MovieStatus = "ACTIVE") => {
        const res = await api.get<ApiResponse<Movie>>(`/movie/${movieId}`, {
            params: { status },
        });

        return res.data;
    },

    getAllMovies: async (cinemaId: number, params?: MovieListParams) => {
        const res = await api.get<ApiResponse<PagingDto<Movie>>>(`/movie/all/${cinemaId}`, {
            params: {
                cinemaId: params?.cinemaId ?? cinemaId,
                movieTypeId: params?.movieTypeId,
                status: params?.status,
                page: params?.page ?? 1,
                size: params?.size ?? 10,
            },
        });

        return res.data;
    },

    createMovie: async (request: MovieCreationRequest | FormData) => {
        const payload = request instanceof FormData ? request : toMovieFormData(request);

        const res = await api.post<ApiResponse<Movie>>("/movie/movie", payload, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        return res.data;
    },

    updateMovie: async (movieId: number, request: MovieUpdateRequest | FormData) => {
        const payload = request instanceof FormData ? request : toMovieFormData(request);

        const res = await api.patch<ApiResponse<Movie>>(`/movie/${movieId}`, payload, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        return res.data;
    },

    deleteMovie: async (movieId: number) => {
        const res = await api.delete<ApiResponse<boolean>>(`/movie/${movieId}`);
        return res.data;
    },
};
