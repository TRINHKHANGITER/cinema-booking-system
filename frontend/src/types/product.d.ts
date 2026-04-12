export type MovieStatus = "ACTIVE" | "INACTIVE";
export type MovieTypeStatus = "ACTIVE" | "INACTIVE";

export interface MovieType {
  movieTypeId: number;
  movieTypeName: string;
  description: string | null;
  status: MovieTypeStatus;
}

export interface Movie {
  movieId: number;
  movieName: string;
  description: string | null;
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
  movieType: MovieType;
  status: MovieStatus;
}
