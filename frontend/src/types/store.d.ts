import type { Movie } from "./product";
import type { ShowDetail, Combo } from "./booking";
import type { comboFood, SelectedCombo } from "./combo";
import type { Showtime } from "./showtime";
import type { User } from "./user";
import type { Seat } from "./seat";

export interface MovieState {
  movies: Movie[];
  selectedMovie: Movie | null;
  loading: boolean;
  error: string | null;
  fetchMovies: () => Promise<void>;
  fetchMovieBySlug: (slug: string) => Promise<Movie | null>;
}

export interface ShowtimeState {
  showtimes: Showtime[];
  loading: boolean;
  error: string | null;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  fetchShowtimeByMovie: (keyword: string) => Promise<void>;
}

export interface BookingState {
  showDetail: ShowDetail | null;
  selectedSeats: Seat[];
  selectedCombos: SelectedCombo[];
  loading: boolean;
  error: string | null;

  fetchShowDetail: (showId: number) => Promise<void>;
  toggleCombo: (combo: comboFood, delta: number) => void;
  resetBooking: () => void;
}

export interface SeatState {
  seats: Seat[];
  selectedSeats: Seat[];
  loading: boolean;
  error: string | null;

  fetchSeats: (roomId: number) => Promise<void>;
  toggleSeat: (seat: Seat, allSeats: Seat[]) => void;
  resetSeats: () => void;
}

export interface FoodState {
  combo: comboFood[];
  comboSelected: Combo[] | null;
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
    phone: string,
    birthDay: string,
  ) => Promise<void>;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchMe: () => Promise<void>;
  refresh: () => Promise<void>;
}
