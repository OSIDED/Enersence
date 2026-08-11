export type Role = "USER" | "ADMIN";

export interface User {
  userId: number;
  fullName: string;
  email: string;
  role: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  userId: number;
  fullName: string;
  email: string;
  role: Role;
}

export interface ApiError {
  detail: string;
  status: number;
}