import api from "../lib/axios";
import type { ApiResponse } from "../types/api";
import type { Cinema, CinemaStatus } from "../types/cinema";
import type { Province, ProvinceStatus } from "../types/province";

export const provinceService = {
    getProvinces: async (status: ProvinceStatus = "ACTIVE") => {
        const res = await api.get<ApiResponse<Province[]>>("/province", {
            params: { status },
        });

        return res.data.result ?? [];
    },

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

        return res.data.result ?? [];
    },
};
