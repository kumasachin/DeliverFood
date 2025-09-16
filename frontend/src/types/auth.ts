export type Role = "customer" | "owner" | "admin";

export interface User {
  email: string;
  role: Role;
  uuid?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SignupData {
  email: string;
  password: string;
  role: Role;
}
