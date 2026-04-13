export type TicketTypeStatus = "ACTIVE" | "INACTIVE";

export type TicketTypeCreationRequest = {
    ticketTypeName: string;
    description: string;
};

export type TicketTypeUpdateRequest = {
    ticketTypeName?: string;
    description?: string;
};

export type TicketTypeResponse = {
    ticketTypeId: number;
    ticketTypeName: string;
    description: string | null;
    status: TicketTypeStatus;
};

export type TicketType = TicketTypeResponse;
