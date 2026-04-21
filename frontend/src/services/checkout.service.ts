import type { CheckoutRequest } from "../types/checkout";
import api from "../lib/axios";

export const checkoutService = {
    createCheckout: async (request: CheckoutRequest) => {
        const res = await api.post("/checkout/vnpay", request);
        return res.data;
    }
}