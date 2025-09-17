import axios, { AxiosInstance, AxiosResponse } from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

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
}

export interface Restaurant {
  uuid: string;
  title: string;
  description: string;
  cuisine: string;
  owner_uuid: string;
  created_at: string;
  coordinates: {
    lat: string;
    lng: string;
  };
}

export interface Meal {
  uuid: string;
  name: string;
  description: string;
  price: number;
  restaurant_uuid: string;
  created_at: string;
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("authToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("userData");
          window.location.href = "/signin";
        }
        return Promise.reject(error);
      }
    );
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await this.api.post(
      "/tokens",
      credentials
    );
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post(
      "/registrations",
      userData
    );
    return response.data;
  }

  async getRestaurants(params?: {
    page?: number;
    limit?: number;
    title?: string;
    description?: string;
    cuisine?: string;
    owner_uuid?: string;
  }): Promise<Restaurant[]> {
    const response: AxiosResponse<Restaurant[]> = await this.api.get(
      "/restaurants",
      { params }
    );
    return response.data;
  }

  async getRestaurant(uuid: string): Promise<Restaurant> {
    const response: AxiosResponse<Restaurant> = await this.api.get(
      `/restaurants/${uuid}`
    );
    return response.data;
  }

  async createRestaurant(
    restaurant: Omit<Restaurant, "uuid" | "created_at" | "owner_uuid">
  ): Promise<Restaurant> {
    const response: AxiosResponse<Restaurant> = await this.api.post(
      "/restaurants",
      restaurant
    );
    return response.data;
  }

  async updateRestaurant(
    uuid: string,
    restaurant: Partial<Restaurant>
  ): Promise<Restaurant> {
    const response: AxiosResponse<Restaurant> = await this.api.put(
      `/restaurants/${uuid}`,
      restaurant
    );
    return response.data;
  }

  async deleteRestaurant(uuid: string): Promise<void> {
    await this.api.delete(`/restaurants/${uuid}`);
  }

  async getRestaurantMeals(
    restaurantUuid: string,
    params?: {
      page?: number;
      limit?: number;
    }
  ): Promise<Meal[]> {
    const response: AxiosResponse<Meal[]> = await this.api.get(
      `/restaurants/${restaurantUuid}/meals`,
      { params }
    );
    return response.data;
  }

  async getMeal(uuid: string): Promise<Meal> {
    const response: AxiosResponse<Meal> = await this.api.get(`/meals/${uuid}`);
    return response.data;
  }

  async createMeal(
    restaurantUuid: string,
    meal: Omit<Meal, "uuid" | "created_at" | "restaurant_uuid">
  ): Promise<Meal> {
    const response: AxiosResponse<Meal> = await this.api.post(
      `/restaurants/${restaurantUuid}/meals`,
      meal
    );
    return response.data;
  }

  async updateMeal(uuid: string, meal: Partial<Meal>): Promise<Meal> {
    const response: AxiosResponse<Meal> = await this.api.put(
      `/meals/${uuid}`,
      meal
    );
    return response.data;
  }

  async deleteMeal(uuid: string): Promise<void> {
    await this.api.delete(`/meals/${uuid}`);
  }

  setAuthToken(token: string): void {
    localStorage.setItem("authToken", token);
  }

  getAuthToken(): string | null {
    return localStorage.getItem("authToken");
  }

  clearAuthToken(): void {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

export const apiService = new ApiService();
export default apiService;
