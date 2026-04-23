import api from "../lib/axios";
import type { ApiResponse } from "../types/api";
import type { Order } from "../types/order";

type OrderComboItemRequest = {
    comboId: number;
    quantity: number;
};

type UpdateOrderCombosRequest = {
    combos: OrderComboItemRequest[];
};

export const bookingService = {
    updateOrderCombos: async (orderId: number, request: UpdateOrderCombosRequest) => {
        const res = await api.put<ApiResponse<Order>>(`/booking/order/${orderId}/combos`, request);
        return res.data;
    },

    cancelOrder: async (orderId: number) => {
        const res = await api.post<ApiResponse<Order>>(`/booking/order/${orderId}/cancel`);
        return res.data;
    },
};
