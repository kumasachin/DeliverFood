import React from "react";
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
} from "@mui/material";
import { Payment, LocalShipping, ShoppingBag } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  useFormState,
  useOrderCalculations,
  useCheckoutProcess,
} from "../../hooks";

export const Checkout = () => {
  const navigate = useNavigate();
  const { state: cartState } = useCart();
  const { state: authState } = useAuth();

  const { values, handleChange, validateRequired } = useFormState({
    address: "",
    phone: "",
    paymentMethod: "card",
  });

  const {
    total: finalTotal,
    subtotal,
    deliveryFee,
    tax,
  } = useOrderCalculations({
    items: cartState.items,
  });

  const { placeOrder, isProcessing, error } = useCheckoutProcess();

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
          Your cart is empty. Please add items before checkout.
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate("/restaurants")}
          sx={{ mt: 2 }}
        >
          Browse Restaurants
        </Button>
      </Container>
    );
  }

  const handlePlaceOrder = async () => {
    if (!validateRequired(["address", "phone"])) {
      return;
    }

    await placeOrder({
      address: values.address,
      phone: values.phone,
      paymentMethod: values.paymentMethod,
      total: finalTotal,
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
        <Payment sx={{ mr: 2, fontSize: 32 }} />
        <Typography variant="h4" component="h1">
          Checkout
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box display="flex" gap={3} flexDirection={{ xs: "column", md: "row" }}>
        <Box flex={1}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                <ShoppingBag sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Order Summary
                </Typography>
              </Box>
              <List dense>
                {cartState.items.map((item) => (
                  <ListItem key={item.meal.id} sx={{ px: 0 }}>
                    <ListItemText
                      primary={item.meal.name}
                      secondary={`${item.quantity}x $${item.meal.price.toFixed(
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
                <Typography variant="h6">${finalTotal.toFixed(2)}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box flex={1}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                <LocalShipping sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Delivery Details
                </Typography>
              </Box>

              <TextField
                label="Delivery Address"
                value={values.address}
                onChange={(e) => handleChange("address", e.target.value)}
                fullWidth
                multiline
                rows={3}
                margin="normal"
                required
                placeholder="Enter your full delivery address"
              />

              <TextField
                label="Phone Number"
                value={values.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                fullWidth
                margin="normal"
                required
                placeholder="Enter your phone number"
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={values.paymentMethod}
                  label="Payment Method"
                  onChange={(e) =>
                    handleChange("paymentMethod", e.target.value)
                  }
                >
                  <MenuItem value="card">Credit/Debit Card</MenuItem>
                  <MenuItem value="cash">Cash on Delivery</MenuItem>
                  <MenuItem value="wallet">Digital Wallet</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                >
                  {isProcessing
                    ? "Placing Order..."
                    : `Place Order - $${finalTotal.toFixed(2)}`}
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => navigate("/cart")}
                  disabled={isProcessing}
                >
                  Back to Cart
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};
