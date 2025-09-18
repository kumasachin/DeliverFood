import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Button,
} from "@mui/material";
import {
  AdminPanelSettings,
  Refresh,
  Search,
  FilterList,
  AutorenewRounded,
} from "@mui/icons-material";
import { useAuth } from "contexts/AuthContext";
import { apiService, OrderResponse } from "services/api";
import { OrderStatus } from "types/order";
import { OrderStatusManager } from "../../components/Order/OrderStatusManager";
import { useAutoRefresh } from "../../hooks/useAutoRefresh";
import { DLSTypography } from "dls/atoms/Typography";
import { DLSButton } from "dls/atoms/Button";
import { DLSCard } from "dls/molecules/Card";

export const AdminOrdersDashboard = () => {
  const { state: authState } = useAuth();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const ordersData = await apiService.getOrders();
      setOrders(ordersData);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useAutoRefresh(
    async () => {
      const result = await apiService.getOrders({});
      setOrders(result || []);
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

  const filteredOrders = useMemo(() => {
    let result = orders;

    if (searchTerm) {
      result = result.filter(
        (order) =>
          order.uuid.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer_uuid
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.restaurant_uuid
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((order) => order.status === statusFilter);
    }

    return result;
  }, [orders, searchTerm, statusFilter]);

  if (!authState.isAuthenticated || authState.user?.role !== "admin") {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Access denied. This page is only available to administrators.
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

  const getOrderCountForStatus = (status: OrderStatus) => {
    return orders.filter((order) => order.status === status).length;
  };

  const statusTabs = [
    { label: "All Orders", status: "all" },
    { label: "Placed", status: OrderStatus.PLACED },
    { label: "Processing", status: OrderStatus.PROCESSING },
    { label: "In Route", status: OrderStatus.IN_ROUTE },
    { label: "Delivered", status: OrderStatus.DELIVERED },
    { label: "Received", status: OrderStatus.RECEIVED },
    { label: "Cancelled", status: OrderStatus.CANCELLED },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <DLSTypography variant="h4" component="h1" gutterBottom sx={{ mb: 0 }}>
          <AdminPanelSettings sx={{ mr: 1, verticalAlign: "middle" }} />
          Admin Orders Dashboard
        </DLSTypography>
        <DLSButton
          variant="outlined"
          startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}
          onClick={fetchOrders}
          disabled={loading}
        >
          Refresh
        </DLSButton>
      </Box>

      <DLSCard sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <TextField
              label="Search Orders"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <Search sx={{ mr: 1, color: "text.secondary" }} />
                ),
              }}
              placeholder="Search by order ID, customer ID, or coupon..."
              sx={{ minWidth: 300 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                label="Status Filter"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                {Object.values(OrderStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <FormControlLabel
              control={
                <Switch
                  checked={autoRefreshEnabled}
                  onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
                  size="small"
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AutorenewRounded fontSize="small" />
                  Auto-refresh (30s)
                </Box>
              }
            />
            <Button
              variant="outlined"
              size="small"
              onClick={fetchOrders}
              disabled={loading}
              startIcon={<AutorenewRounded />}
            >
              Refresh
            </Button>
          </Box>
        </Box>
      </DLSCard>

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
                tab.status === "all" ? (
                  `${tab.label} (${orders.length})`
                ) : (
                  <Badge
                    badgeContent={getOrderCountForStatus(
                      tab.status as OrderStatus
                    )}
                    color="primary"
                  >
                    {tab.label}
                  </Badge>
                )
              }
            />
          ))}
        </Tabs>
      </Box>

      {loading && filteredOrders.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredOrders.length === 0 ? (
        <DLSCard sx={{ textAlign: "center", py: 6 }}>
          <FilterList sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
          <DLSTypography variant="h6" color="textSecondary">
            No orders found
          </DLSTypography>
          <DLSTypography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "No orders in the system yet"}
          </DLSTypography>
        </DLSCard>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {filteredOrders.map((order) => (
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
                      Created: {formatDate(order.created_at)}
                    </DLSTypography>
                    <DLSTypography variant="body2" color="textSecondary">
                      Customer: {order.customer_uuid.slice(-8)}
                    </DLSTypography>
                    {order.restaurant_uuid && (
                      <DLSTypography variant="body2" color="textSecondary">
                        Restaurant: {order.restaurant_uuid.slice(-8)}
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

                <Box
                  sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}
                >
                  <DLSTypography variant="body2" color="textSecondary">
                    Full Order ID: {order.uuid}
                  </DLSTypography>
                </Box>
              </CardContent>
            </DLSCard>
          ))}
        </Box>
      )}
    </Container>
  );
};
