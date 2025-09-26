import { httpClient } from "./client";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: "customer" | "owner";
}

export interface AuthResponse {
  uuid: string;
  email: string;
  role: "customer" | "owner";
  created_at: string;
  token: string;
}

export interface LoginResponse {
  token: string;
  role: "customer" | "owner";
}

export const login = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  const response = await httpClient.post<LoginResponse>("/tokens", credentials);
  return response.data;
};

export const register = async (
  userData: RegisterRequest
): Promise<AuthResponse> => {
  const response = await httpClient.post<AuthResponse>(
    "/registrations",
    userData
  );
  return response.data;
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem("authToken", token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem("authToken");
};

export const clearAuthToken = (): void => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userData");
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};
