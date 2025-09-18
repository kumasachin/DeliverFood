import { OrderStatus } from "./order";
import { Role } from "./auth";

export interface StatusPermissions {
  canTransitionTo: OrderStatus[];
  description: string;
}

export const ORDER_STATUS_PERMISSIONS: Record<
  Role,
  Record<OrderStatus, StatusPermissions>
> = {
  customer: {
    [OrderStatus.PLACED]: {
      canTransitionTo: [OrderStatus.CANCELLED],
      description: "Customers can cancel placed orders",
    },
    [OrderStatus.PROCESSING]: {
      canTransitionTo: [OrderStatus.CANCELLED],
      description: "Customers can cancel orders being processed",
    },
    [OrderStatus.IN_ROUTE]: {
      canTransitionTo: [],
      description: "Customers cannot change orders in route",
    },
    [OrderStatus.DELIVERED]: {
      canTransitionTo: [OrderStatus.RECEIVED],
      description: "Customers can mark delivered orders as received",
    },
    [OrderStatus.RECEIVED]: {
      canTransitionTo: [],
      description: "Order complete - no further changes",
    },
    [OrderStatus.CANCELLED]: {
      canTransitionTo: [],
      description: "Cancelled orders cannot be changed",
    },
  },
  owner: {
    [OrderStatus.PLACED]: {
      canTransitionTo: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      description: "Restaurant owners can start processing or cancel orders",
    },
    [OrderStatus.PROCESSING]: {
      canTransitionTo: [OrderStatus.IN_ROUTE, OrderStatus.CANCELLED],
      description: "Restaurant owners can mark orders ready for delivery",
    },
    [OrderStatus.IN_ROUTE]: {
      canTransitionTo: [OrderStatus.DELIVERED],
      description: "Restaurant owners can mark orders as delivered",
    },
    [OrderStatus.DELIVERED]: {
      canTransitionTo: [],
      description: "Only customers can confirm receipt",
    },
    [OrderStatus.RECEIVED]: {
      canTransitionTo: [],
      description: "Order complete - no further changes",
    },
    [OrderStatus.CANCELLED]: {
      canTransitionTo: [],
      description: "Cancelled orders cannot be changed",
    },
  },
  admin: {
    [OrderStatus.PLACED]: {
      canTransitionTo: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      description: "Admins have full control over order status",
    },
    [OrderStatus.PROCESSING]: {
      canTransitionTo: [OrderStatus.IN_ROUTE, OrderStatus.CANCELLED],
      description: "Admins have full control over order status",
    },
    [OrderStatus.IN_ROUTE]: {
      canTransitionTo: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      description: "Admins have full control over order status",
    },
    [OrderStatus.DELIVERED]: {
      canTransitionTo: [OrderStatus.RECEIVED],
      description: "Admins have full control over order status",
    },
    [OrderStatus.RECEIVED]: {
      canTransitionTo: [],
      description: "Order complete - no further changes",
    },
    [OrderStatus.CANCELLED]: {
      canTransitionTo: [],
      description: "Cancelled orders cannot be changed",
    },
  },
};

export const canUserUpdateOrderStatus = (
  userRole: Role,
  currentStatus: OrderStatus,
  targetStatus: OrderStatus
): boolean => {
  const permissions = ORDER_STATUS_PERMISSIONS[userRole][currentStatus];
  return permissions.canTransitionTo.includes(targetStatus);
};

export const getAvailableStatusTransitions = (
  userRole: Role,
  currentStatus: OrderStatus
): OrderStatus[] => {
  return ORDER_STATUS_PERMISSIONS[userRole][currentStatus].canTransitionTo;
};

export const getStatusChangeDescription = (
  userRole: Role,
  currentStatus: OrderStatus
): string => {
  return ORDER_STATUS_PERMISSIONS[userRole][currentStatus].description;
};
