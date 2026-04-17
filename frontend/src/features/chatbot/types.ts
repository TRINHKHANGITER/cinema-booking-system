import type { MovieStatus } from "../../types/movie";

export type ChatSender = "user" | "bot";

export type ChatMessageType =
    | "text"
    | "movie_list"
    | "genre_list"
    | "showtime_list"
    | "suggestion"
    | "error"
    | "loading";

export type DateTarget = "today" | "tomorrow";

export type ChatIntent =
    | "movies_on_date"
    | "movies_today"
    | "movies_tomorrow"
    | "movies_by_genre"
    | "genres_list"
    | "movie_info"
    | "movie_showtimes"
    | "similar_movie"
    | "movies_by_genre_after_time"
    | "romantic_tonight"
    | "unknown";

export type ChatMovieCard = {
    movieId: number;
    movieName: string;
    movieTypeName: string | null;
    durationMinutes: number | null;
    description: string | null;
    imagePortrait: string | null;
    status: MovieStatus | string | null;
    minimumAge: number | null;
    ratingAverage: number | null;
};

export type ChatGenreTag = {
    genreId: number | null;
    genreName: string;
    usageCount: number;
};

export type ChatShowtimeCard = {
    showTimeId: number;
    movieId: number;
    movieName: string;
    movieTypeName: string | null;
    startTime: string;
    endTime: string | null;
    dateLabel: string;
    timeLabel: string;
    cinemaName: string | null;
    roomName: string | null;
    roomTypeName: string | null;
};

export type ChatIntentEntities = {
    movieName?: string;
    genreKey?: string;
    timeAfter?: string;
    dateTarget?: DateTarget;
    explicitDate?: string;
};

export type ParsedIntent = {
    intent: ChatIntent;
    normalizedInput: string;
    rawInput: string;
    entities: ChatIntentEntities;
};

type MessageMeta = {
    id: string;
    sender: ChatSender;
    createdAt: number;
};

export type TextChatMessage = MessageMeta & {
    type: "text";
    content: string;
};

export type MovieListChatMessage = MessageMeta & {
    type: "movie_list";
    content: string;
    payload: {
        movies: ChatMovieCard[];
    };
};

export type GenreListChatMessage = MessageMeta & {
    type: "genre_list";
    content: string;
    payload: {
        genres: ChatGenreTag[];
    };
};

export type ShowtimeListChatMessage = MessageMeta & {
    type: "showtime_list";
    content: string;
    payload: {
        showtimes: ChatShowtimeCard[];
    };
};

export type SuggestionChatMessage = MessageMeta & {
    type: "suggestion";
    content: string;
    payload: {
        reason?: string;
        movies: ChatMovieCard[];
    };
};

export type ErrorChatMessage = MessageMeta & {
    type: "error";
    content: string;
};

export type LoadingChatMessage = MessageMeta & {
    type: "loading";
    content: string;
};

export type ChatMessage =
    | TextChatMessage
    | MovieListChatMessage
    | GenreListChatMessage
    | ShowtimeListChatMessage
    | SuggestionChatMessage
    | ErrorChatMessage
    | LoadingChatMessage;

export type BotMessageDraft =
    | {
          type: "text";
          content: string;
      }
    | {
          type: "movie_list";
          content: string;
          payload: {
              movies: ChatMovieCard[];
          };
      }
    | {
          type: "genre_list";
          content: string;
          payload: {
              genres: ChatGenreTag[];
          };
      }
    | {
          type: "showtime_list";
          content: string;
          payload: {
              showtimes: ChatShowtimeCard[];
          };
      }
    | {
          type: "suggestion";
          content: string;
          payload: {
              reason?: string;
              movies: ChatMovieCard[];
          };
      }
    | {
          type: "error";
          content: string;
      }
    | {
          type: "loading";
          content: string;
      };

export type QuickAction = {
    id: string;
    label: string;
    query: string;
};
