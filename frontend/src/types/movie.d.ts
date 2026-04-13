import type { MovieTypeResponse } from "./movie-type";

export type MovieStatus = "ACTIVE" | "INACTIVE";

export type MovieCreationResquest = {
    movieName: string;
    description: string;
    videoTrailer: string;
    image: File | Blob;
    durationMinutes: number;
    movieTypeId: number;
    slug?: string | null;
    minimumAge?: number | null;
    imageLandscape?: string | null;
    imagePortrait?: string | null;
    trailerUrl?: string | null;
    ratingAverage?: number | null;
    totalVotes?: number | null;
    releaseDate?: string | null;
    endDate?: string | null;
    country?: string | null;
    producer?: string | null;
    director?: string | null;
    actors?: string | null;
};

export type MovieUpdateResquest = {
    movieName?: string;
    description?: string;
    videoTrailer?: string;
    image?: File | Blob;
    durationMinutes?: number;
    movieTypeId?: number;
    slug?: string | null;
    minimumAge?: number | null;
    imageLandscape?: string | null;
    imagePortrait?: string | null;
    trailerUrl?: string | null;
    ratingAverage?: number | null;
    totalVotes?: number | null;
    releaseDate?: string | null;
    endDate?: string | null;
    country?: string | null;
    producer?: string | null;
    director?: string | null;
    actors?: string | null;
};

export type MovieResponse = {
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
    movieTypeId: number;
    movieType: MovieTypeResponse;
    status: MovieStatus;
};

export type MovieCreationRequest = MovieCreationResquest;
export type MovieUpdateRequest = MovieUpdateResquest;
export type Movie = MovieResponse;
