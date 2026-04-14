import { useMemo, useRef } from "react";
import Slider from "react-slick";
import ArrowLeft from "../components/icon/arrowLeft";
import ArrowRight from "../components/icon/arrowRight";
import { useAppDispatch, useAppSelector } from "../stores/hooks";
import { setSelectedDate } from "../stores/slices/showtimeSlice";

const weekdays = ["Chu Nhat", "Thu Hai", "Thu Ba", "Thu Tu", "Thu Nam", "Thu Sau", "Thu Bay"];

const createDates = (days = 10) => {
    const arr: Date[] = [];
    for (let i = 0; i < days; i += 1) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        arr.push(date);
    }
    return arr;
};

export default function DateSlider() {
    const dispatch = useAppDispatch();
    const selectedDate = useAppSelector((state) => state.showtime.selectedDate);
    const sliderRef = useRef<Slider | null>(null);
    const dates = useMemo(() => createDates(10), []);

    const active = useMemo(() => {
        const index = dates.findIndex((date) => {
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, "0");
            const dd = String(date.getDate()).padStart(2, "0");
            return `${yyyy}-${mm}-${dd}` === selectedDate;
        });

        return index >= 0 ? index : 0;
    }, [dates, selectedDate]);

    const handleSelect = (date: Date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        dispatch(setSelectedDate(`${yyyy}-${mm}-${dd}`));
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
                        const day = String(date.getDate()).padStart(2, "0");
                        const month = String(date.getMonth() + 1).padStart(2, "0");
                        const label = index === 0 ? "Hom Nay" : weekdays[date.getDay()];

                        return (
                            <div key={index} className="px-1">
                                <div
                                    onClick={() => handleSelect(date)}
                                    className={`cursor-pointer w-[80px] h-[65px] rounded-md flex flex-col items-center justify-center text-sm transition ${
                                        active === index ? "bg-[#034ea2] text-white" : ""
                                    }`}
                                >
                                    <span className="text-xs">{label}</span>
                                    <span className="font-semibold">
                                        {day}/{month}
                                    </span>
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
