import api from "../lib/axios";
import type { ApiResponse } from "../types/api";
import type {
    OrderCombo,
    OrderComboRequest,
    OrderComboStatusUpdateRequest,
} from "../types/orderCombo";

export const orderComboService = {
    createOrderCombo: async (data: OrderComboRequest) => {
        const res = await api.post<ApiResponse<OrderCombo>>(`/orderCombo`, data);
        return res.data;
    },

    updateOrderComboStatus: async (orderComboId: number, data: OrderComboStatusUpdateRequest) => {
        const res = await api.patch<ApiResponse<OrderCombo>>(`/orderCombo/${orderComboId}/status`, data);
        return res.data;
    },

    getOrderComboById: async (orderComboId: number) => {
        const res = await api.get<ApiResponse<OrderCombo>>(`/orderCombo/${orderComboId}`);
        return res.data;
    },

    getOrdersCombo: async () => {
        const res = await api.get<ApiResponse<OrderCombo[]>>(`/orderCombo`);
        return res.data;
    },
};
