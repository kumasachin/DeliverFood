export enum OrderStatus {
  PLACED = "placed",
  PROCESSING = "processing",
  IN_ROUTE = "in route",
  DELIVERED = "delivered",
  RECEIVED = "received",
  CANCELLED = "cancelled",
}

export interface OrderItem {
  uuid: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  uuid: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  tip?: number;
  couponCode?: string;
  restaurantUuid: string;
  customerUuid: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewOrder {
  items: OrderItem[];
  tip?: number;
  couponCode?: string;
  restaurantUuid: string;
}

export const ORDER_FLOW: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PLACED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.IN_ROUTE, OrderStatus.CANCELLED],
  [OrderStatus.IN_ROUTE]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  [OrderStatus.DELIVERED]: [OrderStatus.RECEIVED],
  [OrderStatus.RECEIVED]: [],
  [OrderStatus.CANCELLED]: [],
};
