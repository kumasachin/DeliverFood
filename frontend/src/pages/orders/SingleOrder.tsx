import React from "react";
import {
  Container,
  Box,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { Receipt, ArrowBack } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "contexts/AuthContext";
import { useLocalStorage } from "hooks";
import { OrderStatus } from "./OrderStatus";
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

export const SingleOrder = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { state: authState } = useAuth();
  const [orders] = useLocalStorage<Order[]>("orders", []);

  if (!authState.isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">Please sign in to view your order.</Alert>
      </Container>
    );
  }

  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Order not found.
        </Alert>
        <DLSButton
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate("/orders")}
        >
          Back to Orders
        </DLSButton>
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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.meal.price * item.quantity,
    0
  );
  const deliveryFee = 3.99;
  const tax = subtotal * 0.08;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
        <DLSButton
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate("/orders")}
          sx={{ mr: 2 }}
        >
          Back
        </DLSButton>
        <Receipt sx={{ mr: 2, fontSize: 32 }} />
        <DLSTypography variant="h4" component="h1">
          Order Details
        </DLSTypography>
      </Box>

      <DLSCard sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 3 }}
          >
            <Box>
              <DLSTypography variant="h6">
                Order #{order.id.slice(-8)}
              </DLSTypography>
              <DLSTypography variant="body2" color="textSecondary">
                Placed on {formatDate(order.createdAt)}
              </DLSTypography>
            </Box>
            <Chip
              label={order.status.toUpperCase()}
              color={getStatusColor(order.status) as any}
            />
          </Box>

          <OrderStatus currentStatus={order.status} />
        </Box>
      </DLSCard>

      <DLSCard sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <DLSTypography variant="h6" gutterBottom>
            Order Items
          </DLSTypography>
          <List dense>
            {order.items.map((item, index) => (
              <ListItem key={index} sx={{ px: 0 }}>
                <ListItemText
                  primary={item.meal.name}
                  secondary={`${item.quantity}x $${item.meal.price.toFixed(2)}`}
                />
                <DLSTypography variant="body2">
                  ${(item.meal.price * item.quantity).toFixed(2)}
                </DLSTypography>
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
            <DLSTypography>Subtotal:</DLSTypography>
            <DLSTypography>${subtotal.toFixed(2)}</DLSTypography>
          </Box>
          <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
            <DLSTypography>Delivery Fee:</DLSTypography>
            <DLSTypography>${deliveryFee.toFixed(2)}</DLSTypography>
          </Box>
          <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
            <DLSTypography>Tax:</DLSTypography>
            <DLSTypography>${tax.toFixed(2)}</DLSTypography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box display="flex" justifyContent="space-between">
            <DLSTypography variant="h6">Total:</DLSTypography>
            <DLSTypography variant="h6">
              ${order.total.toFixed(2)}
            </DLSTypography>
          </Box>
        </Box>
      </DLSCard>

      <DLSCard sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <DLSTypography variant="h6" gutterBottom>
            Delivery Information
          </DLSTypography>
          <DLSTypography variant="body2" gutterBottom>
            <strong>Address:</strong> {order.address}
          </DLSTypography>
          <DLSTypography variant="body2" gutterBottom>
            <strong>Phone:</strong> {order.phone}
          </DLSTypography>
          <DLSTypography variant="body2">
            <strong>Payment Method:</strong>{" "}
            {order.paymentMethod === "card"
              ? "Credit/Debit Card"
              : order.paymentMethod === "cash"
              ? "Cash on Delivery"
              : "Digital Wallet"}
          </DLSTypography>
        </Box>
      </DLSCard>
    </Container>
  );
};
