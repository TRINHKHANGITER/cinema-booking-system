import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import cinemaReducer from "./slices/cinemaSlice";
import movieReducer from "./slices/movieSlice";
import provinceReducer from "./slices/provinceSlice";
import seatReducer from "./slices/seatSlice";
import showtimeReducer from "./slices/showtimeSlice";
import showtimeSeatReducer from "./slices/showtimeSeatSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        province: provinceReducer,
        cinema: cinemaReducer,
        movie: movieReducer,
        seat: seatReducer,
        showtime: showtimeReducer,
        showtimeSeat: showtimeSeatReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
