import type { MovieTypeEntity, MovieTypeResponse } from "./movie-type";

export type MovieStatus = "ACTIVE" | "INACTIVE" | "COMING_SOON" | "STOPPED";

export type MovieEntity = {
    movieId: number;
    movieName: string;
    description: string;
    durationMinutes: number;
    slug: string | null;
    minimumAge: number | null;
    imageLandscape: string | null;
    imagePortrait: string | null;
    trailerUrl: string | null;
    ratingAverage: number | null;
    totalVotes: number | null;
    releaseDate: string | null;
    endDate: string | null;
    country: string | null;
    producer: string | null;
    director: string | null;
    actors: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    status: MovieStatus;
    movieType: MovieTypeEntity;
};

export type MovieCreationResquest = {
    movieName: string;
    description: string;
    durationMinutes: number;
    movieTypeId: number;
    releaseDate: string;
    endDate: string;
    status: MovieStatus;
    slug?: string | null;
    minimumAge?: number | null;
    imageLandscape?: File | null;
    imagePortrait?: File | null;
    trailerUrl?: string | null;
    ratingAverage?: number | null;
    totalVotes?: number | null;
    country?: string | null;
    producer?: string | null;
    director?: string | null;
    actors?: string | null;
};

export type MovieUpdateResquest = {
    movieName?: string;
    description?: string;
    durationMinutes?: number;
    movieTypeId?: number;
    releaseDate?: string | null;
    endDate?: string | null;
    status?: MovieStatus;
    slug?: string | null;
    minimumAge?: number | null;
    imageLandscape?: File | null;
    imagePortrait?: File | null;
    trailerUrl?: string | null;
    ratingAverage?: number | null;
    totalVotes?: number | null;
    country?: string | null;
    producer?: string | null;
    director?: string | null;
    actors?: string | null;
};

export type MovieResponse = MovieEntity & {
    movieTypeId?: number;
    movieType?: MovieTypeResponse;
};

export type MovieCreationRequest = MovieCreationResquest;
export type MovieUpdateRequest = MovieUpdateResquest;
export type Movie = MovieResponse;
