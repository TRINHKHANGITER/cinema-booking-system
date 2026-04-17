import type {
    ChatGenreTag,
    ChatMessage,
    ChatMovieCard,
    ChatShowtimeCard,
} from "../../features/chatbot/types";

const statusStyles: Record<string, string> = {
    ACTIVE: "bg-emerald-100 text-emerald-700",
    INACTIVE: "bg-gray-200 text-gray-700",
    SCHEDULED: "bg-sky-100 text-sky-700",
};

const renderPoster = (movie: ChatMovieCard) => {
    if (movie.imagePortrait) {
        return (
            <img
                src={movie.imagePortrait}
                alt={movie.movieName}
                className="h-24 w-16 rounded-lg object-cover shadow-sm"
                loading="lazy"
            />
        );
    }

    return (
        <div className="flex h-24 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 text-xs font-semibold text-slate-600">
            No poster
        </div>
    );
};

const MovieCard = ({ movie }: { movie: ChatMovieCard }) => {
    const statusClassName = movie.status ? statusStyles[movie.status] ?? "bg-slate-200 text-slate-700" : "";

    return (
        <article className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex gap-3">
                {renderPoster(movie)}
                <div className="min-w-0 flex-1 space-y-2">
                    <h4 className="line-clamp-2 text-sm font-semibold text-slate-900">{movie.movieName}</h4>

                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                        {movie.movieTypeName ? (
                            <span className="rounded-full bg-orange-100 px-2 py-0.5 font-medium text-orange-700">
                                {movie.movieTypeName}
                            </span>
                        ) : null}

                        {movie.durationMinutes ? (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                                {movie.durationMinutes} phut
                            </span>
                        ) : null}

                        {movie.minimumAge ? (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-700">
                                T{movie.minimumAge}
                            </span>
                        ) : null}

                        {movie.status ? (
                            <span className={`rounded-full px-2 py-0.5 font-medium ${statusClassName}`}>
                                {movie.status}
                            </span>
                        ) : null}
                    </div>

                    {movie.description ? (
                        <p className="text-xs leading-relaxed text-slate-600">{movie.description}</p>
                    ) : null}

                    {movie.ratingAverage ? (
                        <p className="text-xs font-medium text-amber-600">
                            Danh gia: {movie.ratingAverage.toFixed(1)}/10
                        </p>
                    ) : null}
                </div>
            </div>
        </article>
    );
};

const GenreChip = ({ genre }: { genre: ChatGenreTag }) => {
    return (
        <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
            <span>{genre.genreName}</span>
            <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] text-sky-600">
                {genre.usageCount}
            </span>
        </span>
    );
};

const ShowtimeCard = ({ showtime }: { showtime: ChatShowtimeCard }) => {
    return (
        <article className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3">
            <div className="flex flex-col gap-1">
                <h4 className="text-sm font-semibold text-slate-900">{showtime.movieName}</h4>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 font-medium text-indigo-700">
                        {showtime.dateLabel}
                    </span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700">
                        {showtime.timeLabel}
                    </span>
                    {showtime.movieTypeName ? (
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 font-medium text-orange-700">
                            {showtime.movieTypeName}
                        </span>
                    ) : null}
                </div>
                <div className="text-xs leading-relaxed text-slate-600">
                    {showtime.cinemaName ? <p>Rap: {showtime.cinemaName}</p> : null}
                    <p>
                        Phong: {showtime.roomName ?? "Dang cap nhat"}
                        {showtime.roomTypeName ? ` (${showtime.roomTypeName})` : ""}
                    </p>
                </div>
            </div>
        </article>
    );
};

const MessagePayload = ({ message }: { message: ChatMessage }) => {
    if (message.type === "movie_list") {
        return (
            <div className="mt-2 space-y-2">
                {message.payload.movies.map((movie) => (
                    <MovieCard key={`${movie.movieId}-${movie.movieName}`} movie={movie} />
                ))}
            </div>
        );
    }

    if (message.type === "genre_list") {
        return (
            <div className="mt-2 flex flex-wrap gap-2">
                {message.payload.genres.map((genre) => (
                    <GenreChip
                        key={`${genre.genreId ?? genre.genreName}-${genre.genreName}`}
                        genre={genre}
                    />
                ))}
            </div>
        );
    }

    if (message.type === "showtime_list") {
        return (
            <div className="mt-2 space-y-2">
                {message.payload.showtimes.map((showtime) => (
                    <ShowtimeCard key={`${showtime.showTimeId}-${showtime.movieId}`} showtime={showtime} />
                ))}
            </div>
        );
    }

    if (message.type === "suggestion") {
        return (
            <div className="mt-2 space-y-2">
                {message.payload.reason ? (
                    <p className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                        {message.payload.reason}
                    </p>
                ) : null}
                {message.payload.movies.map((movie) => (
                    <MovieCard key={`${movie.movieId}-${movie.movieName}`} movie={movie} />
                ))}
            </div>
        );
    }

    return null;
};

export default MessagePayload;
