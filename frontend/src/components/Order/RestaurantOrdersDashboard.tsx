import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Box,
  Alert,
  CardContent,
  Chip,
  CircularProgress,
  Tab,
  Tabs,
  Badge,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Store,
  Refresh,
  FilterList,
  AutorenewRounded,
} from "@mui/icons-material";
import { useAuth } from "contexts/AuthContext";
import { apiService, OrderResponse } from "services/api";
import { OrderStatus } from "types/order";
import { OrderStatusManager } from "./OrderStatusManager";
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
  <div hidden={value !== index} style={{ marginTop: 16 }}>
    {value === index && children}
  </div>
);

export const RestaurantOrdersDashboard = () => {
  const { state: authState } = useAuth();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!authState.user || authState.user.role !== "owner") {
      setError("Access denied. Restaurant owner account required.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // For now, get all orders and filter by restaurant if needed
      // In a real app, this would be filtered server-side
      const ordersData = await apiService.getOrders();
      setOrders(ordersData);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [authState.user]);

  // Auto-refresh functionality
  const { refreshNow } = useAutoRefresh(
    async () => {
      if (!authState.user || authState.user.role !== "owner") return;

      try {
        const ordersData = await apiService.getOrders();
        setOrders(ordersData);
      } catch (err: any) {
        console.error("Auto-refresh failed:", err);
      }
    },
    {
      enabled: autoRefreshEnabled,
      interval: 20000, // 20 seconds for restaurant owners (more frequent)
      immediate: false,
    }
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (!authState.isAuthenticated || authState.user?.role !== "owner") {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Access denied. This page is only available to restaurant owners.
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

  // Filter orders by status for tabs
  const getFilteredOrders = (status?: OrderStatus) => {
    if (!status) return orders;
    return orders.filter((order) => order.status === status);
  };

  const getOrderCountForStatus = (status: OrderStatus) => {
    return orders.filter((order) => order.status === status).length;
  };

  const statusTabs = [
    { label: "All Orders", status: undefined },
    { label: "New", status: OrderStatus.PLACED },
    { label: "Processing", status: OrderStatus.PROCESSING },
    { label: "In Route", status: OrderStatus.IN_ROUTE },
    { label: "Delivered", status: OrderStatus.DELIVERED },
  ];

  const currentOrders = statusTabs[currentTab].status
    ? getFilteredOrders(statusTabs[currentTab].status)
    : orders;

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
          <Store sx={{ mr: 1, verticalAlign: "middle" }} />
          Restaurant Orders
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

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {statusTabs.map((tab, index) => (
            <Tab
              key={index}
              label={
                tab.status ? (
                  <Badge
                    badgeContent={getOrderCountForStatus(tab.status)}
                    color="primary"
                  >
                    {tab.label}
                  </Badge>
                ) : (
                  `${tab.label} (${orders.length})`
                )
              }
            />
          ))}
        </Tabs>
      </Box>

      {statusTabs.map((tab, index) => (
        <TabPanel key={index} value={currentTab} index={index}>
          {loading && currentOrders.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : currentOrders.length === 0 ? (
            <DLSCard sx={{ textAlign: "center", py: 6 }}>
              <FilterList
                sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
              />
              <DLSTypography variant="h6" color="textSecondary">
                No orders found
              </DLSTypography>
              <DLSTypography
                variant="body2"
                color="textSecondary"
                sx={{ mt: 1 }}
              >
                {tab.status
                  ? `No orders with status "${tab.status}"`
                  : "No orders for your restaurant yet"}
              </DLSTypography>
            </DLSCard>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {currentOrders.map((order) => (
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
                        {order.customer_uuid && (
                          <DLSTypography variant="body2" color="textSecondary">
                            Customer: {order.customer_uuid.slice(-8)}
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
                    />

                    <Box
                      sx={{
                        mt: 2,
                        pt: 2,
                        borderTop: 1,
                        borderColor: "divider",
                      }}
                    >
                      <DLSTypography variant="body2" color="textSecondary">
                        Order placed:{" "}
                        {new Date(order.created_at).toLocaleString()}
                      </DLSTypography>
                    </Box>
                  </CardContent>
                </DLSCard>
              ))}
            </Box>
          )}
        </TabPanel>
      ))}
    </Container>
  );
};
