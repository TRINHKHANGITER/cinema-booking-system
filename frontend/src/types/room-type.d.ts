export type RoomTypeStatus = "ACTIVE" | "INACTIVE";

export type RoomTypeCreationRequest = {
    roomTypeName: string;
    description: string;
};

export type RoomTypeUpdateRequest = {
    roomTypeName?: string;
    description?: string;
};

export type RoomTypeResponse = {
    roomTypeId: number;
    roomTypeName: string;
    description: string | null;
    status: RoomTypeStatus;
};

export type RoomType = RoomTypeResponse;
