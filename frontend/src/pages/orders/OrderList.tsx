import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Box,
  Alert,
  CardContent,
  Chip,
  CircularProgress,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Receipt,
  Visibility,
  Refresh,
  AutorenewRounded,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "contexts/AuthContext";
import { apiService, OrderResponse } from "services/api";
import { OrderStatus } from "types/order";
import { OrderStatusManager } from "../../components/Order/OrderStatusManager";
import { useAutoRefresh } from "../../hooks/useAutoRefresh";
import { DLSTypography } from "dls/atoms/Typography";
import { DLSButton } from "dls/atoms/Button";
import { DLSCard } from "dls/molecules/Card";

export const OrderList = () => {
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!authState.user) return;

    try {
      setLoading(true);
      setError(null);

      let ordersData: OrderResponse[];
      if (authState.user.role === "customer") {
        ordersData = await apiService.getOrders({
          customer_uuid: authState.user.id,
        });
      } else {
        ordersData = await apiService.getOrders();
      }

      setOrders(ordersData);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [authState.user]);

  const { refreshNow } = useAutoRefresh(
    async () => {
      const result = await apiService.getOrders({
        customer_uuid: authState.user?.uuid,
      });
      if (result) {
        setOrders(result);
      }
    },
    {
      enabled: true,
      interval: 30000,
      immediate: false,
    }
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (!authState.isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">Please sign in to view your orders.</Alert>
      </Container>
    );
  }

  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleTitle = (): string => {
    switch (authState.user?.role) {
      case "customer":
        return "My Orders";
      case "owner":
        return "Restaurant Orders";
      case "admin":
        return "All Orders";
      default:
        return "Orders";
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <DLSTypography variant="h4" component="h1" gutterBottom sx={{ mb: 0 }}>
          <Receipt sx={{ mr: 1, verticalAlign: "middle" }} />
          {getRoleTitle()}
        </DLSTypography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={autoRefreshEnabled}
                onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
                size="small"
              />
            }
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <AutorenewRounded fontSize="small" />
                Auto-refresh
              </Box>
            }
          />

          <DLSButton
            variant="outlined"
            startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}
            onClick={() => {
              fetchOrders();
              refreshNow();
            }}
            disabled={loading}
            size="small"
          >
            Refresh Now
          </DLSButton>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && orders.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : orders.length === 0 ? (
        <DLSCard sx={{ textAlign: "center", py: 6 }}>
          <DLSTypography variant="h6" color="textSecondary">
            No orders found
          </DLSTypography>
          <DLSTypography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            {authState.user?.role === "customer"
              ? "You haven't placed any orders yet"
              : "No orders to manage"}
          </DLSTypography>
        </DLSCard>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {orders.map((order) => (
            <DLSCard key={order.uuid}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Box>
                    <DLSTypography variant="h6" component="h3">
                      Order #{order.uuid.slice(-8)}
                    </DLSTypography>
                    <DLSTypography variant="body2" color="textSecondary">
                      {formatDate(order.created_at)}
                    </DLSTypography>
                  </Box>
                  <DLSTypography variant="h6" color="primary">
                    {formatPrice(order.total_price)}
                  </DLSTypography>
                </Box>

                <OrderStatusManager
                  orderUuid={order.uuid}
                  initialStatus={order.status as OrderStatus}
                  showHistory={false}
                  onStatusChange={fetchOrders}
                />

                {order.coupon_code && (
                  <Chip
                    label={`Coupon: ${order.coupon_code}`}
                    size="small"
                    color="success"
                    sx={{ mt: 2 }}
                  />
                )}

                <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                  <DLSButton
                    variant="outlined"
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => navigate(`/orders/${order.uuid}`)}
                  >
                    View Details
                  </DLSButton>
                </Box>
              </CardContent>
            </DLSCard>
          ))}
        </Box>
      )}
    </Container>
  );
};
