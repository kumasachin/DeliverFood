import { useState, useCallback } from "react";
import { OrderStatus, ORDER_FLOW } from "../types/order";
import { Role } from "../types/auth";
import {
  canUserUpdateOrderStatus,
  getAvailableStatusTransitions,
} from "../types/permissions";
import { apiService } from "../services/api";

export interface UseOrderStatusResult {
  status: OrderStatus | null;
  isLoading: boolean;
  error: string | null;
  canTransitionTo: (targetStatus: OrderStatus, userRole?: Role) => boolean;
  getAvailableTransitions: (userRole: Role) => OrderStatus[];
  updateStatus: (
    orderUuid: string,
    newStatus: OrderStatus,
    userRole: Role
  ) => Promise<boolean>;
  refreshStatus: (orderUuid: string) => Promise<void>;
  history: Array<{ status: string; changed_at: string }>;
  loadHistory: (orderUuid: string) => Promise<void>;
}

export const useOrderStatus = (): UseOrderStatusResult => {
  const [status, setStatus] = useState<OrderStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<
    Array<{ status: string; changed_at: string }>
  >([]);

  const canTransitionTo = useCallback(
    (targetStatus: OrderStatus, userRole?: Role): boolean => {
      if (!status) return false;

      // Check basic order flow
      const isValidTransition = ORDER_FLOW[status].includes(targetStatus);
      if (!isValidTransition) return false;

      // Check user permissions if role provided
      if (userRole) {
        return canUserUpdateOrderStatus(userRole, status, targetStatus);
      }

      return true;
    },
    [status]
  );

  const getAvailableTransitions = useCallback(
    (userRole: Role): OrderStatus[] => {
      if (!status) return [];
      return getAvailableStatusTransitions(userRole, status);
    },
    [status]
  );

  const refreshStatus = useCallback(
    async (orderUuid: string): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiService.getOrderStatus(orderUuid);
        setStatus(response.status as OrderStatus);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load order status");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updateStatus = useCallback(
    async (
      orderUuid: string,
      newStatus: OrderStatus,
      userRole: Role
    ): Promise<boolean> => {
      if (!canTransitionTo(newStatus, userRole)) {
        setError(
          `Cannot transition from ${status} to ${newStatus}. Insufficient permissions or invalid transition.`
        );
        return false;
      }

      try {
        setIsLoading(true);
        setError(null);
        await apiService.updateOrderStatus(orderUuid, newStatus);
        setStatus(newStatus);
        return true;
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to update order status");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [status, canTransitionTo]
  );

  const loadHistory = useCallback(async (orderUuid: string): Promise<void> => {
    try {
      setError(null);
      const historyData = await apiService.getOrderHistory(orderUuid);
      setHistory(historyData);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load order history");
    }
  }, []);

  return {
    status,
    isLoading,
    error,
    canTransitionTo,
    getAvailableTransitions,
    updateStatus,
    refreshStatus,
    history,
    loadHistory,
  };
};
