import type { Movie } from "../types/product";
import type { ShowDetail, ShowTimeSeat } from "./booking";
import type { comboFood } from "./combo";
import type { Showtime } from "./showtime";
import type { User } from "./user";
interface MovieState {
  movies: Movie[];
  selectedMovie: Movie | null;
  loading: boolean;
  error: string | null;
  fetchMovies: () => Promise<void>;
  fetchMovieBySlug: (slug: string) => Promise<void>;
}

interface ShowtimeState {
  showtimes: Showtime[];
  loading: boolean;
  error: string | null;
  selectedDate: string;
  setSelectedDate: (date: string) => void;

  fetchShowtimeByMovie: (slug: string) => Promise<void>;
}
export interface BookingState {
  showDetail: ShowDetail | null;
  selectedSeats: ShowTimeSeat["seat"][];
  selectedCombos: Combo[];
  loading: boolean;
  error: string | null;

  fetchShowDetail: (showId: number) => Promise<void>;
  // toggleSeat: (seat: ShowTimeSeat["seat"] & { price?: number }) => void;
  toggleCombo: (combo: Combo, delta: number) => void;
  // getTotalPrice: () => number;
  resetBooking: () => void;
}
interface SeatState {
  seats: Seat[];
  selectedSeats: Seat[];
  loading: boolean;
  error: string | null;

  fetchSeats: (showId: number) => Promise<void>;
  toggleSeat: (seat: Seat, allSeats: Seat[]) => void;
  resetSeats: () => void;
}

interface FoodState {
  combo: comboFood[];
  comboSelected: comboFood[] | null;
  loading: boolean;
  error: string | null;
  fetchFoods: () => Promise<void>;
}


export interface AuthState {
  accessToken: string | null;
  user: User | null;
  loading: boolean;

  setAccessToken: (accessToken: string) => void;
  clearState: () => void;
  signUp: (
    fullName: string,
    password: string,
    email: string,
    phone:string,
    birthDay:string
    
  ) => Promise<void>;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchMe: () => Promise<void>;
  refresh: () => Promise<void>;
}