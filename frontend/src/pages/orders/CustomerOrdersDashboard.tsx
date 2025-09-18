import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Box,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
  FormControlLabel,
  Switch,
  Chip,
} from "@mui/material";
import {
  Receipt,
  Refresh,
  CheckCircle,
  LocalShipping,
  Cancel,
  Schedule,
  Restaurant,
} from "@mui/icons-material";
import { useAuth } from "contexts/AuthContext";
import {
  apiService,
  OrderResponse,
  Restaurant as RestaurantType,
} from "services/api";
import { OrderStatus } from "types/order";
import { OrderStatusManager } from "../../components/Order/OrderStatusManager";
import { useAutoRefresh } from "../../hooks/useAutoRefresh";
import { DLSTypography } from "dls/atoms/Typography";
import { DLSButton } from "dls/atoms/Button";
import { DLSCard } from "dls/molecules/Card";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && children}
  </div>
);

export const CustomerOrdersDashboard = () => {
  const { state: authState } = useAuth();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [restaurants, setRestaurants] = useState<
    Record<string, RestaurantType>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  const fetchRestaurantDetails = useCallback(
    async (restaurantUuids: string[]) => {
      try {
        const uniqueUuids = Array.from(new Set(restaurantUuids));
        const restaurantPromises = uniqueUuids.map((uuid) =>
          apiService.getRestaurant(uuid).catch(() => null)
        );

        const restaurantData = await Promise.all(restaurantPromises);
        const restaurantMap: Record<string, RestaurantType> = {};

        restaurantData.forEach((restaurant, index) => {
          if (restaurant) {
            restaurantMap[uniqueUuids[index]] = restaurant;
          }
        });

        setRestaurants((prev) => ({ ...prev, ...restaurantMap }));
      } catch (error) {
        console.error("Failed to fetch restaurant details:", error);
      }
    },
    []
  );

  const fetchOrders = useCallback(async () => {
    if (!authState.user || authState.user.role !== "customer") {
      setError("Access denied. Customer account required.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const customerOrders = await apiService.getOrders({
        customer_uuid: authState.user.uuid,
      });

      setOrders(customerOrders);

      // Fetch restaurant details for all orders
      const restaurantUuids = Array.from(
        new Set(customerOrders.map((order) => order.restaurant_uuid))
      );
      if (restaurantUuids.length > 0) {
        await fetchRestaurantDetails(restaurantUuids);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [authState.user, fetchRestaurantDetails]);

  const { refreshNow } = useAutoRefresh(fetchOrders, {
    enabled: autoRefreshEnabled,
    interval: 30000,
    immediate: false,
  });

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (!authState.isAuthenticated || authState.user?.role !== "customer") {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Access denied. This page is only available to customers.
        </Alert>
      </Container>
    );
  }

  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PLACED:
        return <Schedule color="info" />;
      case OrderStatus.PROCESSING:
        return <Restaurant color="warning" />;
      case OrderStatus.IN_ROUTE:
        return <LocalShipping color="primary" />;
      case OrderStatus.DELIVERED:
        return <CheckCircle color="success" />;
      case OrderStatus.RECEIVED:
        return <CheckCircle color="success" />;
      case OrderStatus.CANCELLED:
        return <Cancel color="error" />;
      default:
        return <Schedule color="disabled" />;
    }
  };

  const getFilteredOrders = (status?: OrderStatus) => {
    if (!status) return orders;
    return orders.filter((order) => order.status === status);
  };

  const getTabLabel = (status: OrderStatus, count: number) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {getStatusIcon(status)}
      <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      <Chip label={count} size="small" />
    </Box>
  );

  const activeOrders = getFilteredOrders(OrderStatus.PLACED);
  const processingOrders = getFilteredOrders(OrderStatus.PROCESSING);
  const inRouteOrders = getFilteredOrders(OrderStatus.IN_ROUTE);
  const deliveredOrders = getFilteredOrders(OrderStatus.DELIVERED);
  const completedOrders = getFilteredOrders(OrderStatus.RECEIVED);
  const cancelledOrders = getFilteredOrders(OrderStatus.CANCELLED);

  const renderOrderCard = (order: OrderResponse) => (
    <DLSCard key={order.uuid} sx={{ mb: 2 }}>
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box>
            <DLSTypography variant="h6" gutterBottom>
              Order #{order.uuid.slice(-8)}
            </DLSTypography>
            <DLSTypography variant="body2" color="textSecondary">
              Created: {formatDate(order.created_at)}
            </DLSTypography>
            {order.restaurant_uuid && (
              <DLSTypography variant="body2" color="textSecondary">
                Restaurant:{" "}
                {restaurants[order.restaurant_uuid]?.title ||
                  `ID: ${order.restaurant_uuid.slice(-8)}`}
              </DLSTypography>
            )}
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <DLSTypography variant="h6" color="primary">
              {formatPrice(order.total_price)}
            </DLSTypography>
            {order.coupon_code && (
              <Chip
                label={`Coupon: ${order.coupon_code}`}
                size="small"
                color="success"
                sx={{ mt: 0.5 }}
              />
            )}
          </Box>
        </Box>

        <OrderStatusManager
          orderUuid={order.uuid}
          initialStatus={order.status as OrderStatus}
          showHistory={false}
          onStatusChange={fetchOrders}
        />
      </Box>
    </DLSCard>
  );

  const tabPanels = [
    { orders: activeOrders, label: "Active" },
    { orders: processingOrders, label: "Processing" },
    { orders: inRouteOrders, label: "In Route" },
    { orders: deliveredOrders, label: "Delivered" },
    { orders: completedOrders, label: "Completed" },
    { orders: cancelledOrders, label: "Cancelled" },
  ];

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
          My Orders
        </DLSTypography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={autoRefreshEnabled}
                onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
                color="primary"
              />
            }
            label="Auto-refresh"
          />
          <DLSButton
            variant="outlined"
            startIcon={<Refresh />}
            onClick={refreshNow}
            disabled={loading}
          >
            Refresh
          </DLSButton>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => setCurrentTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab label={getTabLabel(OrderStatus.PLACED, activeOrders.length)} />
            <Tab
              label={getTabLabel(
                OrderStatus.PROCESSING,
                processingOrders.length
              )}
            />
            <Tab
              label={getTabLabel(OrderStatus.IN_ROUTE, inRouteOrders.length)}
            />
            <Tab
              label={getTabLabel(OrderStatus.DELIVERED, deliveredOrders.length)}
            />
            <Tab
              label={getTabLabel(OrderStatus.RECEIVED, completedOrders.length)}
            />
            <Tab
              label={getTabLabel(OrderStatus.CANCELLED, cancelledOrders.length)}
            />
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          tabPanels.map((panel, index) => (
            <TabPanel key={index} value={currentTab} index={index}>
              <Box sx={{ py: 3 }}>
                {panel.orders.length === 0 ? (
                  <Alert severity="info">
                    No {panel.label.toLowerCase()} orders found.
                  </Alert>
                ) : (
                  panel.orders.map(renderOrderCard)
                )}
              </Box>
            </TabPanel>
          ))
        )}
      </Box>
    </Container>
  );
};
