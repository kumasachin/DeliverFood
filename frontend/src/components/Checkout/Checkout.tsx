import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import {
  Payment,
  LocalShipping,
  ShoppingBag,
  CheckCircle,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { apiService, CreateOrderRequest } from "../../services/api";

export const Checkout = () => {
  const navigate = useNavigate();
  const { state: cartState, clearCart } = useCart();
  const { state: authState } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const [formData, setFormData] = useState({
    address: "",
    phone: "",
    paymentMethod: "card",
    notes: "",
  });

  const subtotal = cartState.total;
  const deliveryFee = 3.99;
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + tax;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = async () => {
    if (!authState.user || cartState.items.length === 0) {
      setError("Unable to place order. Please check your cart and try again.");
      return;
    }

    if (!formData.address.trim() || !formData.phone.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const orderData: CreateOrderRequest = {
        order_items: cartState.items.map((item) => ({
          meal_uuid: item.meal.uuid || item.meal.id,
          quantity: item.quantity,
        })),
        tip_amount: 0,
      };

      await apiService.createOrder(orderData);

      setOrderSuccess(true);
      clearCart();

      setTimeout(() => {
        navigate("/orders");
      }, 2000);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || "Failed to place order. Please try again.";

      // Enhanced error handling for blocked users
      if (
        errorMessage.includes("not active") ||
        errorMessage.includes("blocked")
      ) {
        setError(
          "Your account has been temporarily restricted. Please contact customer support for assistance."
        );
      } else if (
        errorMessage.includes("customer_uuid") &&
        errorMessage.includes("not found")
      ) {
        setError(
          "Account verification required. Please sign out and sign in again."
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (!authState.isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">
          Please sign in to proceed with checkout.
        </Alert>
      </Container>
    );
  }

  if (cartState.items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info">
          Your cart is empty. Add some items before checkout.
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={() => navigate("/restaurants")}>
            Browse Restaurants
          </Button>
        </Box>
      </Container>
    );
  }

  if (orderSuccess) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box textAlign="center">
          <CheckCircle sx={{ fontSize: 80, color: "success.main", mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Order Placed Successfully!
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Redirecting to orders...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ display: "flex", alignItems: "center" }}
      >
        <ShoppingBag sx={{ mr: 2 }} />
        Checkout
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
        }}
      >
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <List>
              {cartState.items.map((item) => (
                <ListItem key={item.id} sx={{ px: 0 }}>
                  <ListItemText
                    primary={item.meal.name}
                    secondary={`${item.quantity} × $${item.meal.price.toFixed(
                      2
                    )}`}
                  />
                  <Typography variant="body2">
                    ${(item.meal.price * item.quantity).toFixed(2)}
                  </Typography>
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 2 }} />
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography>Subtotal:</Typography>
              <Typography>${subtotal.toFixed(2)}</Typography>
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography>Delivery Fee:</Typography>
              <Typography>${deliveryFee.toFixed(2)}</Typography>
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography>Tax:</Typography>
              <Typography>${tax.toFixed(2)}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6">${total.toFixed(2)}</Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center" }}
            >
              <LocalShipping sx={{ mr: 1 }} />
              Delivery Information
            </Typography>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Delivery Address"
                required
                multiline
                rows={3}
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                sx={{ mb: 2 }}
                placeholder="Enter your full delivery address"
              />

              <TextField
                fullWidth
                label="Phone Number"
                required
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                sx={{ mb: 2 }}
                placeholder="Enter your phone number"
              />
            </Box>

            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center" }}
            >
              <Payment sx={{ mr: 1 }} />
              Payment Method
            </Typography>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={formData.paymentMethod}
                label="Payment Method"
                onChange={(e) =>
                  handleInputChange("paymentMethod", e.target.value)
                }
              >
                <MenuItem value="card">Credit Card</MenuItem>
                <MenuItem value="cash">Cash on Delivery</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Special Instructions (Optional)"
              multiline
              rows={2}
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              sx={{ mb: 3 }}
              placeholder="Any special instructions for your order"
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handlePlaceOrder}
              disabled={
                isProcessing ||
                !formData.address.trim() ||
                !formData.phone.trim()
              }
              startIcon={isProcessing ? <CircularProgress size={20} /> : null}
            >
              {isProcessing
                ? "Placing Order..."
                : `Place Order - $${total.toFixed(2)}`}
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};
