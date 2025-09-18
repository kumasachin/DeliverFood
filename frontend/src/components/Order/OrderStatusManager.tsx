import React, { useEffect } from "react";
import { Box, Alert } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import { useOrderStatus } from "../../hooks/useOrderStatus";
import { OrderStatusDisplay } from "./OrderStatusDisplay";
import { OrderHistory } from "./OrderHistory";
import { OrderStatus } from "../../types/order";

interface OrderStatusManagerProps {
  orderUuid: string;
  initialStatus?: OrderStatus;
  showHistory?: boolean;
  onStatusChange?: () => void;
}

export const OrderStatusManager = ({
  orderUuid,
  initialStatus,
  showHistory = false,
  onStatusChange,
}: OrderStatusManagerProps) => {
  const { state: authState } = useAuth();
  const {
    status,
    isLoading,
    error,
    getAvailableTransitions,
    updateStatus,
    refreshStatus,
    setStatus,
    history,
    loadHistory,
  } = useOrderStatus();

  const handleStatusUpdate = async (
    newStatus: OrderStatus
  ): Promise<boolean> => {
    if (!authState.user) return false;

    const success = await updateStatus(
      orderUuid,
      newStatus,
      authState.user.role
    );

    if (success && onStatusChange) {
      onStatusChange();
    }

    return success;
  };

  useEffect(() => {
    if (initialStatus) {
      setStatus(initialStatus);
    } else {
      refreshStatus(orderUuid);
    }
  }, [orderUuid, initialStatus, refreshStatus, setStatus]);

  useEffect(() => {
    if (showHistory) {
      loadHistory(orderUuid);
    }
  }, [orderUuid, showHistory, loadHistory]);

  if (!authState.user) {
    return (
      <Alert severity="warning">Please sign in to view order status</Alert>
    );
  }

  const currentStatus = status || initialStatus;
  if (!currentStatus) {
    return <Alert severity="info">Loading order status...</Alert>;
  }

  const availableTransitions = getAvailableTransitions(authState.user.role);
  const canUpdateStatus = availableTransitions.length > 0;

  return (
    <Box data-testid="order-status-manager">
      <OrderStatusDisplay
        orderUuid={orderUuid}
        currentStatus={currentStatus}
        userRole={authState.user.role}
        canUpdateStatus={canUpdateStatus}
        onStatusUpdate={handleStatusUpdate}
        isLoading={isLoading}
        error={error}
        availableTransitions={availableTransitions}
      />

      {showHistory && (
        <Box sx={{ mt: 3 }}>
          <OrderHistory history={history} currentStatus={currentStatus} />
        </Box>
      )}
    </Box>
  );
};
