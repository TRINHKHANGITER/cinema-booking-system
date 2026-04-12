export type Role = "ADMIN" | "USER" | "STAFF";
export type UserStatus = "ACTIVE" | "LOCKED" | "SUSPENDED" | "DELETED";
export type Sex = "male" | "female" | "other";

export interface User {
  userId: number;
  fullName: string;
  username: string;
  phoneNumber: string;
  dateOfBirth: string | null;
  sex: Sex | null;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
  status: UserStatus;
}
