export type TicketStatus = "ACTIVE" | "CANCELLED";

export type TicketEntity = {
    ticketId: number;
    orderId: number;
    showTimeId: number;
    seatId: number;
    priceTicketId: number | null;
    unitPrice: number | null;
    qrCode: string | null;
    checkedInAt: string | null;
    status: TicketStatus;
    createdAt: string;
    updatedAt: string;
};

export type TicketCreationRequest = {
    orderId: number;
    showTimeId: number;
    seatId: number;
};

export type TicketStatusUpdateRequest = {
    status: TicketStatus;
};

export type Ticket = TicketEntity;
