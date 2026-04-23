export type RoomTypeStatus = "ACTIVE" | "INACTIVE";

export type RoomTypeEntity = {
    roomTypeId: number;
    roomTypeName: string;
    description: string | null;
    status: RoomTypeStatus;
};

export type RoomTypeCreationRequest = {
    roomTypeName: string;
    description: string;
    status?: RoomTypeStatus;
};

export type RoomTypeUpdateRequest = {
    roomTypeName?: string;
    description?: string;
    status?: RoomTypeStatus;
};

export type RoomTypeFilterParams = {
    name?: string;
    status?: RoomTypeStatus | "";
    page?: number;
    size?: number;
};

export type RoomTypeResponse = RoomTypeEntity;
export type RoomType = RoomTypeEntity;
