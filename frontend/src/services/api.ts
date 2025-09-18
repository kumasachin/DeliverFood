import axios, { AxiosInstance } from "axios";
import { Meal } from "../types/meal";

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
  role: "customer" | "owner";
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

export interface OrderStatusResponse {
  status: string;
  updated_at: string;
}

export interface OrderHistoryResponse {
  status: string;
  changed_at: string;
}

export interface UpdateOrderStatusRequest {
  status: string;
}

export interface OrderResponse {
  uuid: string;
  customer_uuid: string;
  restaurant_uuid: string;
  status: string;
  total_price: number;
  tip_amount?: number;
  discount_percentage?: number;
  coupon_code?: string;
  created_at: string;
}

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  customer_uuid?: string;
}

export interface Coupon {
  uuid: string;
  coupon_code: string;
  percentage: number;
  restaurant_uuid: string;
  status: string;
  created_at: string;
}

export interface CreateCouponRequest {
  coupon_code: string;
  percentage: number;
}

export interface UpdateCouponRequest {
  percentage: number;
}

export interface CreateOrderRequest {
  order_items: Array<{
    meal_uuid: string;
    quantity: number;
  }>;
  tip_amount?: number;
  coupon_code?: string;
}

export interface BlockedUser {
  uuid: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

const createApiService = () => {
  const httpClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  httpClient.interceptors.request.use(
    (config) => {
      const authToken = localStorage.getItem("authToken");
      if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  httpClient.interceptors.response.use(
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

  const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await httpClient.post<LoginResponse>(
      "/tokens",
      credentials
    );
    return response.data;
  };

  const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await httpClient.post<AuthResponse>(
      "/registrations",
      userData
    );
    return response.data;
  };

  const setAuthToken = (token: string): void => {
    localStorage.setItem("authToken", token);
  };

  const getAuthToken = (): string | null => {
    return localStorage.getItem("authToken");
  };

  const clearAuthToken = (): void => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
  };

  const isAuthenticated = (): boolean => {
    return !!getAuthToken();
  };

  const getRestaurants = async (params?: {
    page?: number;
    limit?: number;
    title?: string;
    description?: string;
    cuisine?: string;
    owner_uuid?: string;
  }): Promise<Restaurant[]> => {
    const response = await httpClient.get<Restaurant[]>("/restaurants", {
      params,
    });
    return response.data;
  };

  const getRestaurant = async (uuid: string): Promise<Restaurant> => {
    const response = await httpClient.get<Restaurant>(`/restaurants/${uuid}`);
    return response.data;
  };

  const createRestaurant = async (
    restaurant: Omit<Restaurant, "uuid" | "created_at" | "owner_uuid">
  ): Promise<Restaurant> => {
    const response = await httpClient.post<Restaurant>(
      "/restaurants",
      restaurant
    );
    return response.data;
  };

  const updateRestaurant = async (
    uuid: string,
    restaurant: Partial<Restaurant>
  ): Promise<Restaurant> => {
    const response = await httpClient.put<Restaurant>(
      `/restaurants/${uuid}`,
      restaurant
    );
    return response.data;
  };

  const deleteRestaurant = async (uuid: string): Promise<void> => {
    await httpClient.delete(`/restaurants/${uuid}`);
  };

  const getRestaurantMeals = async (
    restaurantUuid: string,
    params?: { page?: number; limit?: number }
  ): Promise<Meal[]> => {
    const response = await httpClient.get<any[]>(
      `/restaurants/${restaurantUuid}/meals`,
      { params }
    );

    return response.data.map((mealData: any) => ({
      id: mealData.uuid,
      uuid: mealData.uuid,
      name: mealData.title,
      description: mealData.description,
      price: mealData.price,
      category: mealData.section,
      restaurantId: mealData.restaurant_uuid,
      restaurantUuid: mealData.restaurant_uuid,
      available: true,
    }));
  };

  const getMeal = async (uuid: string): Promise<Meal> => {
    const response = await httpClient.get<any>(`/meals/${uuid}`);
    const mealData = response.data;

    return {
      id: mealData.uuid,
      uuid: mealData.uuid,
      name: mealData.title,
      description: mealData.description,
      price: mealData.price,
      category: mealData.section,
      restaurantId: mealData.restaurant_uuid,
      restaurantUuid: mealData.restaurant_uuid,
      available: true,
    };
  };

  const createMeal = async (
    restaurantUuid: string,
    meal: Omit<Meal, "id" | "uuid" | "restaurantId" | "restaurantUuid">
  ): Promise<Meal> => {
    const backendMealData = {
      title: meal.name,
      description: meal.description || "",
      price: meal.price,
      section: meal.category || "Main",
      restaurant_uuid: restaurantUuid,
    };

    const response = await httpClient.post<{ meal: any }>(
      `/restaurants/${restaurantUuid}/meals`,
      backendMealData
    );

    const createdMeal = response.data.meal;
    return {
      id: createdMeal.uuid,
      uuid: createdMeal.uuid,
      name: createdMeal.title,
      description: createdMeal.description,
      price: createdMeal.price,
      category: createdMeal.section,
      restaurantId: createdMeal.restaurant_uuid,
      restaurantUuid: createdMeal.restaurant_uuid,
      available: true,
    };
  };

  const updateMeal = async (
    uuid: string,
    meal: Partial<Meal>
  ): Promise<Meal> => {
    const backendUpdateData: any = {};
    if (meal.name) backendUpdateData.title = meal.name;
    if (meal.description !== undefined)
      backendUpdateData.description = meal.description;
    if (meal.price !== undefined) backendUpdateData.price = meal.price;
    if (meal.category) backendUpdateData.section = meal.category;

    const response = await httpClient.put<any>(
      `/meals/${uuid}`,
      backendUpdateData
    );
    const updatedMeal = response.data;

    return {
      id: updatedMeal.uuid,
      uuid: updatedMeal.uuid,
      name: updatedMeal.title,
      description: updatedMeal.description,
      price: updatedMeal.price,
      category: updatedMeal.section,
      restaurantId: updatedMeal.restaurant_uuid,
      restaurantUuid: updatedMeal.restaurant_uuid,
      available: true,
    };
  };

  const deleteMeal = async (uuid: string): Promise<void> => {
    await httpClient.delete(`/meals/${uuid}`);
  };

  const getOrderStatus = async (
    orderUuid: string
  ): Promise<OrderStatusResponse> => {
    const response = await httpClient.get<OrderStatusResponse>(
      `/orders/${orderUuid}/status`
    );
    return response.data;
  };

  const getOrderHistory = async (
    orderUuid: string
  ): Promise<OrderHistoryResponse[]> => {
    const response = await httpClient.get<OrderHistoryResponse[]>(
      `/orders/${orderUuid}/history`
    );
    return response.data;
  };

  const updateOrderStatus = async (
    orderUuid: string,
    status: string
  ): Promise<void> => {
    await httpClient.patch(`/orders/${orderUuid}`, { status });
  };

  const getOrders = async (
    params: GetOrdersParams = {}
  ): Promise<OrderResponse[]> => {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined)
      searchParams.append("page", params.page.toString());
    if (params.limit !== undefined)
      searchParams.append("limit", params.limit.toString());
    if (params.customer_uuid)
      searchParams.append("customer_uuid", params.customer_uuid);

    const queryString = searchParams.toString();
    const response = await httpClient.get<OrderResponse[]>(
      `/orders${queryString ? "?" + queryString : ""}`
    );
    return response.data;
  };

  const getOrder = async (orderUuid: string): Promise<OrderResponse> => {
    const response = await httpClient.get<OrderResponse>(
      `/orders/${orderUuid}`
    );
    return response.data;
  };

  const getRestaurantOrders = async (
    restaurantUuid: string,
    params: GetOrdersParams = {}
  ): Promise<OrderResponse[]> => {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined)
      searchParams.append("page", params.page.toString());
    if (params.limit !== undefined)
      searchParams.append("limit", params.limit.toString());

    const queryString = searchParams.toString();
    const response = await httpClient.get<OrderResponse[]>(
      `/restaurants/${restaurantUuid}/orders${
        queryString ? "?" + queryString : ""
      }`
    );
    return response.data;
  };

  const createOrder = async (
    order: CreateOrderRequest
  ): Promise<OrderResponse> => {
    const response = await httpClient.post<{ order: OrderResponse }>(
      `/orders`,
      order
    );
    return response.data.order;
  };

  const getRestaurantCoupons = async (
    restaurantUuid: string,
    params?: { page?: number; limit?: number }
  ): Promise<Coupon[]> => {
    const response = await httpClient.get<Coupon[]>(
      `/restaurants/${restaurantUuid}/coupons`,
      { params }
    );
    return response.data;
  };

  const getCoupon = async (uuid: string): Promise<Coupon> => {
    const response = await httpClient.get<Coupon>(`/coupons/${uuid}`);
    return response.data;
  };

  const createCoupon = async (
    restaurantUuid: string,
    coupon: CreateCouponRequest
  ): Promise<Coupon> => {
    const couponWithRestaurant = {
      ...coupon,
      restaurant_uuid: restaurantUuid,
    };
    const response = await httpClient.post<{ coupon: Coupon }>(
      `/restaurants/${restaurantUuid}/coupons`,
      couponWithRestaurant
    );
    return response.data.coupon;
  };

  const updateCoupon = async (
    uuid: string,
    coupon: UpdateCouponRequest
  ): Promise<Coupon> => {
    const response = await httpClient.patch<Coupon>(`/coupons/${uuid}`, coupon);
    return response.data;
  };

  const deleteCoupon = async (uuid: string): Promise<void> => {
    await httpClient.delete(`/coupons/${uuid}`);
  };

  const searchUserByEmail = async (email: string): Promise<BlockedUser> => {
    const response = await httpClient.get<BlockedUser>("/users/search", {
      params: { email },
    });
    return response.data;
  };

  const getBlockedUsers = async (): Promise<BlockedUser[]> => {
    const response = await httpClient.get<BlockedUser[]>("/blocked-users");
    return response.data;
  };

  const blockUser = async (userUuid: string): Promise<void> => {
    await httpClient.post(`/block/${userUuid}`);
  };

  const unblockUser = async (userUuid: string): Promise<void> => {
    await httpClient.post(`/unblock/${userUuid}`);
  };

  const getUser = async (userUuid: string): Promise<any> => {
    const response = await httpClient.get(`/users/${userUuid}`);
    return response.data;
  };

  return {
    login,
    register,
    setAuthToken,
    getAuthToken,
    clearAuthToken,
    isAuthenticated,
    getRestaurants,
    getRestaurant,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    getRestaurantMeals,
    getMeal,
    createMeal,
    updateMeal,
    deleteMeal,
    getOrderStatus,
    getOrderHistory,
    updateOrderStatus,
    getOrders,
    getOrder,
    getRestaurantOrders,
    createOrder,
    getRestaurantCoupons,
    getCoupon,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    searchUserByEmail,
    getBlockedUsers,
    blockUser,
    unblockUser,
    getUser,
  };
};

export const apiService = createApiService();
export default apiService;
