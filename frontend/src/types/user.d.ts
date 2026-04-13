export type Role = "ADMIN" | "USER" | "STAFF";
export type UserStatus = "ACTIVE" | "LOCKED" | "SUSPENDED" | "DELETED";
export type GioiTinh = "male" | "female" | "other";
export type Sex = GioiTinh;

export type UserCreationRequest = {
    fullName: string;
    phoneNumber: string;
    username: string;
    dateOfBirth?: string | null;
    sex?: GioiTinh | null;
    email: string;
    password: string;
};

export type UserUpdateRequest = {
    fullName?: string;
    phoneNumber?: string;
    dateOfBirth?: string | null;
    sex?: GioiTinh | null;
};

export type UserResponse = {
    userId: number;
    fullName: string;
    username: string;
    phoneNumber: string;
    dateOfBirth: string | null;
    sex: GioiTinh | null;
    email: string;
    role: Role;
    createdAt: string;
    updatedAt: string;
    status: UserStatus;
};

export type User = UserResponse;
