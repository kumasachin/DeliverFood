import React from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { Receipt, ArrowBack } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useLocalStorage } from "../../hooks";
import { OrderStatus } from "./OrderStatus";

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
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate("/orders")}
        >
          Back to Orders
        </Button>
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
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate("/orders")}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Receipt sx={{ mr: 2, fontSize: 32 }} />
        <Typography variant="h4" component="h1">
          Order Details
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 3 }}
          >
            <Box>
              <Typography variant="h6">Order #{order.id.slice(-8)}</Typography>
              <Typography variant="body2" color="text.secondary">
                Placed on {formatDate(order.createdAt)}
              </Typography>
            </Box>
            <Chip
              label={order.status.toUpperCase()}
              color={getStatusColor(order.status) as any}
            />
          </Box>

          <OrderStatus currentStatus={order.status} />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Order Items
          </Typography>
          <List dense>
            {order.items.map((item, index) => (
              <ListItem key={index} sx={{ px: 0 }}>
                <ListItemText
                  primary={item.meal.name}
                  secondary={`${item.quantity}x $${item.meal.price.toFixed(2)}`}
                />
                <Typography variant="body2">
                  ${(item.meal.price * item.quantity).toFixed(2)}
                </Typography>
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography>Subtotal:</Typography>
            <Typography>${subtotal.toFixed(2)}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography>Delivery Fee:</Typography>
            <Typography>${deliveryFee.toFixed(2)}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography>Tax:</Typography>
            <Typography>${tax.toFixed(2)}</Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box display="flex" justifyContent="space-between">
            <Typography variant="h6">Total:</Typography>
            <Typography variant="h6">${order.total.toFixed(2)}</Typography>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Delivery Information
          </Typography>
          <Typography variant="body2" gutterBottom>
            <strong>Address:</strong> {order.address}
          </Typography>
          <Typography variant="body2" gutterBottom>
            <strong>Phone:</strong> {order.phone}
          </Typography>
          <Typography variant="body2">
            <strong>Payment Method:</strong>{" "}
            {order.paymentMethod === "card"
              ? "Credit/Debit Card"
              : order.paymentMethod === "cash"
              ? "Cash on Delivery"
              : "Digital Wallet"}
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};
