export type ProvinceStatus = "ACTIVE" | "INACTIVE";

export type ProvinceEntity = {
    provinceId: number;
    provinceName: string;
    status: ProvinceStatus;
};

export type ProvinceCreationRequest = {
    provinceName: string;
    status?: ProvinceStatus;
};

export type ProvinceUpdateRequest = {
    provinceName?: string;
    status?: ProvinceStatus;
};

export type ProvinceFilterParams = {
    provinceId?: number;
    name?: string;
    status?: ProvinceStatus | "";
    page?: number;
    size?: number;
};

export type ProvinceResponse = ProvinceEntity;
export type Province = ProvinceEntity;
