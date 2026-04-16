import api from "../lib/axios";
import type { ApiResponse } from "../types/api";
import type { Province, ProvinceStatus } from "../types/province";

export const provinceService = {
    getProvinces: async (status?: ProvinceStatus) => {
        const res = await api.get<ApiResponse<Province[]>>("/province", {
            params: {
                status,
            },
        });

        return res.data;
    },
};
