import api from "../lib/axios";
import type { ApiResponse } from "../types/api";
import type { Cinema, CinemaStatus } from "../types/cinema";

export const cinemaService = {


    getCinemasByProvince: async (
        provinceId: number,
        isShowing = true,
        status: CinemaStatus = "ACTIVE"
    ) => {
        const res = await api.get<ApiResponse<Cinema[]>>("/cinema", {
            params: {
                provinceId,
                isShowing,
                status,
            },
        });

        return res.data;
    },
};
