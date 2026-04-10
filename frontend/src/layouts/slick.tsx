import Slider from "react-slick";
import { useRef, useState } from "react";
import ArrowRight from "../components/icon/arrowRight";
import ArrowLeft from "../components/icon/arrowLeft";
import useShowtimeStore from "../stores/showtime";

const weekdays = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

const createDates = (days = 10) => {
  const arr = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    arr.push(date);
  }
  return arr;
};

export default function DateSlider() {
  const sliderRef = useRef<Slider | null>(null);
  const dates = createDates(10);
  const [active, setActive] = useState(0);
  const { setSelectedDate } = useShowtimeStore();

  const handleSelect = (date: Date, index: number) => {
    setActive(index);
    // Format thành "YYYY-MM-DD"
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, "0");
    const dd = date.getDate().toString().padStart(2, "0");
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  const settings = {
    dots: false,
    infinite: false,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    responsive: [{ breakpoint: 768, settings: { slidesToShow: 3 } }],
  };

  return (
    <div className="flex items-center justify-center gap-3 w-full">
      <button
        onClick={() => sliderRef.current?.slickPrev()}
        className="flex items-center justify-center w-9 h-9 transition cursor-pointer sm:hidden"
      >
        <ArrowLeft />
      </button>

      <div className="w-full max-w-[380px]">
        <Slider ref={sliderRef} {...settings}>
          {dates.map((date, index) => {
            const day = date.getDate().toString().padStart(2, "0");
            const month = (date.getMonth() + 1).toString().padStart(2, "0");
            const label = index === 0 ? "Hôm Nay" : weekdays[date.getDay()];

            return (
              <div key={index} className="px-1">
                <div
                  onClick={() => handleSelect(date, index)}
                  className={`cursor-pointer w-[80px] h-[65px] rounded-md flex flex-col items-center justify-center text-sm transition ${
                    active === index ? "bg-[#034ea2] text-white" : ""
                  }`}
                >
                  <span className="text-xs">{label}</span>
                  <span className="font-semibold">{day}/{month}</span>
                </div>
              </div>
            );
          })}
        </Slider>
      </div>

      <button
        onClick={() => sliderRef.current?.slickNext()}
        className="flex items-center justify-center w-9 h-9 transition rounded-full cursor-pointer sm:hidden"
      >
        <ArrowRight />
      </button>
    </div>
  );
}