export type Role = "USER" | "STAFF" | "ADMIN";
export type UserStatus = "PENDING_VERIFY" | "ACTIVE" | "LOCKED" | "SUSPENDED" | "DELETED";
export type GioiTinh = "male" | "female" | "other";
export type Sex = GioiTinh;

export type UserEntity = {
    userId: number;
    fullName: string;
    phoneNumber: string;
    dateOfBirth: string | null;
    sex: GioiTinh | null;
    email: string;
    role: Role;
    createdAt: string;
    updatedAt: string;
    status: UserStatus;
};

export type UserCreationRequest = {
    fullName: string;
    phoneNumber: string;
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

export type ChangeEmailRequest = {
    newEmail: string;
};

export type ConfirmChangeEmailRequest = {
    newEmail: string;
    otp: string;
};

export type AdminUserCreationRequest = {
    fullName: string;
    phoneNumber: string;
    email: string;
    password: string;
    role: Role;
    status: UserStatus;
    dateOfBirth?: string | null;
    sex?: GioiTinh | null;
};

export type AdminUserUpdateRequest = {
    fullName?: string;
    phoneNumber?: string;
    email?: string;
    password?: string;
    role?: Role;
    status?: UserStatus;
    dateOfBirth?: string | null;
    sex?: GioiTinh | null;
};

export type UserFilterParams = {
    name?: string;
    role?: Role | "";
    status?: UserStatus | "";
    page?: number;
    size?: number;
};

export type UserResponse = UserEntity;
export type User = UserResponse;

