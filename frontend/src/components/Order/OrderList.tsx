import React from "react";
import {
  Container,
  Box,
  Chip,
  Alert,
} from "@mui/material";
import { Receipt, Visibility } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "contexts/AuthContext";
import { useLocalStorage } from "hooks";
import { DLSTypography } from "dls/atoms/Typography";
import { DLSButton } from "dls/atoms/Button";
import { DLSCard } from "dls/molecules/Card";

interface Order {
  id: string;
  items: any[];
  total: number;
  address: string;
  phone: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  restaurantId?: string | null;
}

export const OrderList = () => {
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const [orders] = useLocalStorage<Order[]>("orders", []);

  if (!authState.isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">Please sign in to view your orders.</Alert>
      </Container>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "placed":
        return "primary";
      case "processing":
        return "warning";
      case "in route":
        return "info";
      case "delivered":
        return "success";
      case "received":
        return "default";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (orders.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
          <Receipt sx={{ mr: 2, fontSize: 32 }} />
          <DLSTypography variant="h4" component="h1">
            Your Orders
          </DLSTypography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          You haven't placed any orders yet.
        </Alert>

        <DLSButton variant="contained" onClick={() => navigate("/restaurants")}>
          Start Shopping
        </DLSButton>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
        <Receipt sx={{ mr: 2, fontSize: 32 }} />
        <DLSTypography variant="h4" component="h1">
          Your Orders
        </DLSTypography>
      </Box>

      <Box sx={{ mb: 3 }}>
        {orders.map((order) => (
          <DLSCard key={order.id} sx={{ mb: 2 }}>
            <Box sx={{ p: 2 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="flex-start"
                sx={{ mb: 2 }}
              >
                <Box>
                  <DLSTypography variant="h6" gutterBottom>
                    Order #{order.id.slice(-8)}
                  </DLSTypography>
                  <DLSTypography variant="body2" color="textSecondary">
                    {formatDate(order.createdAt)}
                  </DLSTypography>
                </Box>
                <Chip
                  label={order.status.toUpperCase()}
                  color={getStatusColor(order.status) as any}
                  size="small"
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <DLSTypography variant="body2" color="textSecondary" gutterBottom>
                  Items: {order.items.length} • Total: ${order.total.toFixed(2)}
                </DLSTypography>
                <DLSTypography variant="body2" color="textSecondary">
                  Delivery Address: {order.address}
                </DLSTypography>
              </Box>

              <Box display="flex" gap={2}>
                <DLSButton
                  variant="outlined"
                  size="small"
                  startIcon={<Visibility />}
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  View Details
                </DLSButton>
              </Box>
            </Box>
          </DLSCard>
        ))}
      </Box>
    </Container>
  );
};
