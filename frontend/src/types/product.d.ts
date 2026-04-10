export interface Movie {
  movieId: number;
  movieTypeId: number;
  movieName: string;
  description?: string;
  age?: number;
  imageLandscape?: string;
  imagePortrait?: string;
  rate?: number;
  totalVotes?: number;
  startDate?: string;
  endDate?: string;
  slug?: string;
  trailer?: string;
  duration: number;
  createdAt?: string;
  status: number;
  country?: string;
  producer?: string;
  director?: string;
  actors?: string[];
  movietype: {
    movieTypeName: string;
  };
}
