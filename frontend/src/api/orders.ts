import { httpClient } from "./client";

export interface OrderStatusResponse {
  status: string;
  updated_at: string;
}

export interface OrderHistoryResponse {
  status: string;
  changed_at: string;
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

export interface CreateOrderRequest {
  order_items: Array<{
    meal_uuid: string;
    quantity: number;
  }>;
  tip_amount?: number;
  coupon_code?: string;
}

export const getOrderStatus = async (
  orderUuid: string
): Promise<OrderStatusResponse> => {
  const response = await httpClient.get<OrderStatusResponse>(
    `/orders/${orderUuid}/status`
  );
  return response.data;
};

export const getOrderHistory = async (
  orderUuid: string
): Promise<OrderHistoryResponse[]> => {
  const response = await httpClient.get<OrderHistoryResponse[]>(
    `/orders/${orderUuid}/history`
  );
  return response.data;
};

export const updateOrderStatus = async (
  orderUuid: string,
  status: string
): Promise<void> => {
  await httpClient.patch(`/orders/${orderUuid}`, { status });
};

export const getOrders = async (
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

export const getOrder = async (orderUuid: string): Promise<OrderResponse> => {
  const response = await httpClient.get<OrderResponse>(`/orders/${orderUuid}`);
  return response.data;
};

export const getRestaurantOrders = async (
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

export const createOrder = async (
  order: CreateOrderRequest
): Promise<OrderResponse> => {
  const response = await httpClient.post<{ order: OrderResponse }>(
    `/orders`,
    order
  );
  return response.data.order;
};
