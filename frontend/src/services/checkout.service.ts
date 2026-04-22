import type { CheckoutRequest } from "../types/checkout";
import type { ApiResponse } from "../types/api";
import api from "../lib/axios";

export const checkoutService = {
    createCheckout: async (request: CheckoutRequest) => {
        const res = await api.post<ApiResponse<string>>("/checkout/vnpay", request);
        return res.data;
    },

    handleReturn: async (search: string) => {
        const query = search.startsWith("?") ? search : `?${search}`;
        const res = await api.get<boolean>(`/checkout/vnpay/return${query}`);
        return res.data;
    },
};
