
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import Arrow from "../components/icon/arrow";
import { useState } from "react";

type Movie = {
  id: number;
  name: string;
  cinemas: {
    name: string;
    dates: {
      date: string;
      times: string[];
    }[];
  }[];
};

// call api
const movies: Movie[] = [
  {
    id: 1,
    name: "Avengers: Endgame",
    cinemas: [
      {
        name: "CGV Aeon Mall",
        dates: [
          { date: "2026-03-05", times: ["09:00", "13:30", "18:00"] },
          { date: "2026-03-06", times: ["10:00", "15:00", "20:30"] }
        ]
      },
      {
        name: "Lotte Cinema",
        dates: [
          { date: "2026-03-05", times: ["11:00", "16:00", "21:00"] }
        ]
      }
    ]
  },
  {
    id: 2,
    name: "Spider-Man: No Way Home",
    cinemas: [
      {
        name: "CGV Vincom",
        dates: [
          { date: "2026-03-05", times: ["09:30", "14:00", "19:00"] }
        ]
      }
    ]
  }
];

const HeroSlider = () => {
  const [open, setOpen] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedTheater, setSelectedTheater] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedShowTime, setSelectedShowTime] = useState("");

 const settings = {
  dots: false,
  infinite: true,
  speed: 4500,
  slidesToShow: 1,
  centerMode: true,
  centerPadding: "190px",
  autoplay: true,
  autoplaySpeed: 800,

  responsive: [
    {
      breakpoint: 1280, // < xl
      settings: {
        centerPadding: "100px"
      }
    },
    {
      breakpoint: 1024, // < lg
      settings: {
        centerMode: false,
        centerPadding: "0px",
        slidesToShow: 1
      }
    },
    {
      breakpoint: 768, // < md
      settings: {
        centerMode: false,
        centerPadding: "0px",
        slidesToShow: 1
      }
    }
  ]
};

  const slides = [
    "/images/banner/2048-tai.jpg",
    "/images/banner/cam-on-nguoi-da-thuc-cung-toi.jpg",
    "/images/banner/chuyen-kinh-di.jpg"
  ];

  const cinemas = selectedMovie?.cinemas || [];

  const dates =
    selectedMovie?.cinemas.find((c) => c.name === selectedTheater)?.dates || [];

  const times =
    dates.find((d) => d.date === selectedDay)?.times || [];

  return (
    <div className="relative h-auto overflow-hidden pb-10">
      <Slider {...settings}>
        {slides.map((img, i) => (
          <div key={i} className="xl:px-6 lg:px-0">
            <img src={img} className="w-full object-cover" />
          </div>
        ))}
      </Slider>

      {/* QUICK BUY */}
      <div className="quick-buy hidden xl:grid absolute z-50 grid-cols-11 max-w-6xl h-14 w-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] bg-white rounded left-2/4 bottom-14 translate-y-1/2 -translate-x-2/4">

        {/* MOVIE */}
        <div
          className="col-span-3 flex items-center gap-2 cursor-pointer relative"
          onClick={() => setOpen(open === "movie" ? "" : "movie")}
        >
          <span className="bg-[#f58020] text-[10px] text-white px-1.5 py-0.5 rounded-full ml-2">
            1
          </span>

          <div className="text-sm truncate">
            {selectedMovie?.name || "Chọn phim"}
          </div>

          <div className="ml-auto pr-2">
            <Arrow />
          </div>

          {open === "movie" && (
            <div className="absolute bottom-full left-0 w-full bg-white shadow-lg max-h-56 overflow-y-auto">
              {movies.map((movie) => (
                <div
                  key={movie.id}
                  className="px-3 py-2 text-sm hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMovie(movie);
                    setSelectedTheater("");
                    setSelectedDay("");
                    setSelectedShowTime("");
                    setOpen("");
                  }}
                >
                  {movie.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* THEATER */}
        <div
          className={`col-span-2 flex items-center gap-2 relative ${
            !selectedMovie ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
          onClick={() => {
            if (!selectedMovie) return;
            setOpen(open === "theater" ? "" : "theater");
          }}
        >
          <span className="bg-[#f58020] text-[10px] text-white px-1.5 py-0.5 rounded-full ml-2">
            2
          </span>

          <div className="text-sm truncate">
            {selectedTheater || "Chọn rạp"}
          </div>

          <Arrow />

          {open === "theater" && (
            <div className="absolute bottom-full left-0 w-full bg-white shadow-lg">
              {cinemas.map((cinema, i) => (
                <div
                  key={i}
                  className="px-3 py-2 text-sm hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTheater(cinema.name);
                    setSelectedDay("");
                    setSelectedShowTime("");
                    setOpen("");
                  }}
                >
                  {cinema.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DATE */}
        <div
          className={`col-span-2 flex items-center gap-2 relative ${
            !selectedTheater ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
          onClick={() => {
            if (!selectedTheater) return;
            setOpen(open === "day" ? "" : "day");
          }}
        >
          <span className="bg-[#f58020] text-[10px] text-white px-1.5 py-0.5 rounded-full ml-2">
            3
          </span>

          <div className="text-sm">
            {selectedDay || "Chọn ngày"}
          </div>

          <Arrow />

          {open === "day" && (
            <div className="absolute bottom-full left-0 w-full bg-white shadow-lg">
              {dates.map((d, i) => (
                <div
                  key={i}
                  className="px-3 py-2 text-sm hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDay(d.date);
                    setSelectedShowTime("");
                    setOpen("");
                  }}
                >
                  {d.date}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TIME */}
        <div
          className={`col-span-2 flex items-center gap-2 relative ${
            !selectedDay ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
          onClick={() => {
            if (!selectedDay) return;
            setOpen(open === "time" ? "" : "time");
          }}
        >
          <span className="bg-[#f58020] text-[10px] text-white px-1.5 py-0.5 rounded-full ml-2">
            4
          </span>

          <div className="text-sm">
            {selectedShowTime || "Chọn giờ"}
          </div>

          <Arrow />

          {open === "time" && (
            <div className="absolute bottom-full left-0 w-full bg-white shadow-lg">
              {times.map((t, i) => (
                <div
                  key={i}
                  className="px-3 py-2 text-sm hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedShowTime(t);
                    setOpen("");
                  }}
                >
                  {t}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BUTTON */}
        <div className="col-span-2">
          <button
            disabled={!selectedShowTime}
            className={`w-full h-full rounded-sm ${
              selectedShowTime
                ? "bg-[rgb(245,128,32)] cursor-pointer"
                : "bg-orange-300 cursor-not-allowed"
            }`}
          >
            Mua vé nhanh
          </button>
        </div>
      </div>
    </div>
  );
};
  
export default HeroSlider;