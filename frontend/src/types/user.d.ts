export type Role = "USER" | "STAFF";
export type UserStatus = "ACTIVE" | "LOCKED" | "SUSPENDED" | "DELETED";
export type GioiTinh = "male" | "female" | "other";
export type Sex = GioiTinh;

export type UserEntity = {
    userId: number;
    fullName: string;
    phoneNumber: string;
    username: string;
    dateOfBirth: string | null;
    sex: GioiTinh | null;
    password: string;
    email: string;
    role: Role;
    createdAt: string;
    updatedAt: string;
    status: UserStatus;
};

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

export type UserResponse = Omit<UserEntity, "password">;
export type User = UserResponse;
