import React from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  IconButton,
  Divider,
  Alert,
} from "@mui/material";
import {
  Add,
  Remove,
  Delete,
  ShoppingCartOutlined,
  ShoppingCart,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";

export const Cart = () => {
  const navigate = useNavigate();
  const { state: cartState, updateQuantity, removeItem, clearCart } = useCart();
  const { state: authState } = useAuth();

  if (!authState.isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">Please sign in to view your cart.</Alert>
      </Container>
    );
  }

  if (cartState.items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          textAlign="center"
          sx={{ py: 8 }}
        >
          <ShoppingCartOutlined
            sx={{ fontSize: 80, color: "text.secondary", mb: 2 }}
          />
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Add some delicious meals to get started!
          </Typography>
          <Button variant="contained" onClick={() => navigate("/restaurants")}>
            Browse Restaurants
          </Button>
        </Box>
      </Container>
    );
  }

  const handleQuantityChange = (mealId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(mealId);
    } else {
      updateQuantity(mealId, newQuantity);
    }
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
        <ShoppingCart sx={{ mr: 2, fontSize: 32 }} />
        <Typography variant="h4" component="h1">
          Your Cart
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        {cartState.items.map((item) => (
          <Card key={item.meal.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" component="h3">
                    {item.meal.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ${item.meal.price.toFixed(2)} each
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    From: {item.restaurantName}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" sx={{ gap: 2 }}>
                  <Box display="flex" alignItems="center">
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleQuantityChange(item.meal.id, item.quantity - 1)
                      }
                    >
                      <Remove />
                    </IconButton>
                    <Typography
                      sx={{ mx: 2, minWidth: 20, textAlign: "center" }}
                    >
                      {item.quantity}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleQuantityChange(item.meal.id, item.quantity + 1)
                      }
                    >
                      <Add />
                    </IconButton>
                  </Box>

                  <Typography
                    variant="h6"
                    sx={{ minWidth: 80, textAlign: "right" }}
                  >
                    ${(item.meal.price * item.quantity).toFixed(2)}
                  </Typography>

                  <IconButton
                    color="error"
                    onClick={() => removeItem(item.meal.id)}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="body1">Subtotal:</Typography>
            <Typography variant="body1">
              ${cartState.total.toFixed(2)}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="body1">Delivery Fee:</Typography>
            <Typography variant="body1">$3.99</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="body1">Tax:</Typography>
            <Typography variant="body1">
              ${(cartState.total * 0.08).toFixed(2)}
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box display="flex" justifyContent="space-between" sx={{ mb: 3 }}>
            <Typography variant="h6">Total:</Typography>
            <Typography variant="h6">
              ${(cartState.total + 3.99 + cartState.total * 0.08).toFixed(2)}
            </Typography>
          </Box>

          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              color="error"
              onClick={clearCart}
              sx={{ flex: 1 }}
            >
              Clear Cart
            </Button>
            <Button
              variant="contained"
              onClick={handleCheckout}
              sx={{ flex: 2 }}
            >
              Proceed to Checkout
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};
