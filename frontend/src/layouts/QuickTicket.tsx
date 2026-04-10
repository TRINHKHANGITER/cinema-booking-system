import { useState } from "react";

const steps = [
  { id: 1, label: "Chọn phim" },
  { id: 2, label: "Chọn rạp" },
  { id: 3, label: "Chọn ngày" },
  { id: 4, label: "Chọn giờ" },
];

const QuickBooking = () => {
  const [movie, setMovie] = useState("");
  const [cinema, setCinema] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  return (
    <div className="w-full bg-black/70 backdrop-blur-md p-6 rounded-2xl">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">

        {/* Steps */}
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-3">

            {/* Số thứ tự */}
            <div className="w-10 h-10 flex items-center justify-center 
                            rounded-full bg-orange-500 text-white font-bold">
              {step.id}
            </div>

            {/* Select */}
            <select
              className="flex-1 h-11 px-3 rounded-lg 
                         bg-white text-black 
                         focus:outline-none focus:ring-2 focus:ring-orange-500"
              onChange={(e) => {
                if (index === 0) setMovie(e.target.value);
                if (index === 1) setCinema(e.target.value);
                if (index === 2) setDate(e.target.value);
                if (index === 3) setTime(e.target.value);
              }}
            >
              <option value="">{step.label}</option>
              <option>Option 1</option>
              <option>Option 2</option>
            </select>
          </div>
        ))}

        {/* Button */}
        <button
          className="h-11 px-6 bg-orange-500 
                     hover:bg-orange-600 
                     text-white font-semibold 
                     rounded-lg transition duration-300"
        >
          Mua vé nhanh
        </button>

      </div>
    </div>
  );
};

export default QuickBooking;