export type ProvinceStatus = "ACTIVE" | "INACTIVE";

export type ProvinceResponse = {
    provinceId: number;
    provinceName: string;
    status: ProvinceStatus;
};

export type Province = ProvinceResponse;
