import type { ComboRequest } from "./combo";
import type { TicketCreationRequest } from "./ticket";

export type CheckoutRequest = {
    userId: number;
    tickets: TicketCreationRequest[];
    combos: ComboRequest[];
};
