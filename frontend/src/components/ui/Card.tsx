import Star from "../icon/star";
import BuyTicket from "../icon/buy-ticket";
import type { Movie } from "../../types/product";
import { Link } from "react-router-dom";
import { resolveMovieLandscapeImage, resolveMovieText } from "../../utils/utils";

type CardProps = {
  w?: number;
  h?: number;
  movie: Movie;
};

const Card = ({ w = 140, h = 200, movie }: CardProps) => {
  const detailPath = `/xuat-chieu/${movie.slug ?? movie.movieId}`;
  const detailState = { movieId: movie.movieId, movie };
  const movieName = resolveMovieText(movie.movieName, "Movie");
  const imageLandscape = resolveMovieLandscapeImage(movie.imageLandscape);
  const movieRating = resolveMovieText(
    movie.ratingAverage === null || movie.ratingAverage === undefined
      ? undefined
      : String(movie.ratingAverage),
    "N/A"
  );

  return (
    <div
      className="inline-block whitespace-nowrap relative max-w-full"
      style={{ width: w, height: h }}
    >
      <div className="inline-block cursor-pointer rounded overflow-hidden card__movies max-w-full">
        <div className="object-cover rounded relative card__img max-w-full">
          <div className="absolute hidden md:block w-full h-full z-10 cursor-pointer bg-[#00000080] transition-all duration-300 ease-in-out opacity-0 hover:opacity-100">
            <Link
              to={detailPath}
              state={detailState}
              className="card__hover__content flex flex-col justify-center items-center w-full h-full"
            >
              <span className="text-white bg-[#f26b38] w-[120px] h-[40px] hover:bg-[#fb9440] rounded text-sm px-5 py-2.5 text-center inline-flex items-center gap-x-2">
                <BuyTicket />
                <span>Mua vé</span>
              </span>
            </Link>
          </div>

          <Link to={detailPath} state={detailState}>
            <img
              alt={movieName}
              width={w}
              height={h}
              style={{ width: w, height: h }}
              className="object-cover duration-500 ease-in-out object-center"
              src={imageLandscape}
            />
          </Link>

          <div className="vote">
            <div className="absolute right-[5px] bottom-10 flex items-center justify-center">
              <span>
                <Star />
              </span>
              <span className="text-[18px] font-bold text-white">
                {movieRating}
              </span>
            </div>
          </div>

          <div className="age__limit absolute bottom-[6px] right-[6px]">
            <span className="bg-[#F58020] px-1 py-[2px] text-sm text-white font-bold rounded">
              T{movie.minimumAge}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-2" style={{ width: w }}>
        <Link className="text-sm font-semibold" to={detailPath} state={detailState}>
          {movieName}
        </Link>
      </div>
    </div>
  );
};

export default Card;
