export type Role = "customer" | "owner" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  uuid?: string;
  isActive: boolean;
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
