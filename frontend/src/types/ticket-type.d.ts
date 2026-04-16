export type TicketTypeStatus = "ACTIVE" | "INACTIVE";

export type TicketTypeEntity = {
    ticketTypeId: number;
    ticketTypeName: string;
    description: string | null;
    status: TicketTypeStatus;
};

export type TicketTypeCreationRequest = {
    ticketTypeName: string;
    description: string;
};

export type TicketTypeUpdateRequest = {
    ticketTypeName?: string;
    description?: string;
};

export type TicketTypeResponse = TicketTypeEntity;
export type TicketType = TicketTypeEntity;
