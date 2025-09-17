import React from "react";
import {
  Add,
  Remove,
  Delete,
  ShoppingCartOutlined,
  ShoppingCart,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCart } from "contexts/CartContext";
import { useAuth } from "contexts/AuthContext";
import { DLSTypography } from "dls/atoms/Typography";
import { DLSButton } from "dls/atoms/Button";
import { DLSCard } from "dls/molecules/Card";
import { Container, Box, IconButton, Alert, Divider } from "dls/atoms";

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
          <DLSTypography variant="h5" gutterBottom>
            Your cart is empty
          </DLSTypography>
          <DLSTypography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
            Add some delicious meals to get started!
          </DLSTypography>
          <DLSButton
            variant="contained"
            onClick={() => navigate("/restaurants")}
          >
            Browse Restaurants
          </DLSButton>
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
        <DLSTypography variant="h4" component="h1">
          Your Cart
        </DLSTypography>
      </Box>

      <Box sx={{ mb: 3 }}>
        {cartState.items.map((item) => (
          <DLSCard key={item.meal.id} sx={{ mb: 2 }}>
            <Box sx={{ p: 2 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box sx={{ flex: 1 }}>
                  <DLSTypography variant="h6" component="h3">
                    {item.meal.name}
                  </DLSTypography>
                  <DLSTypography variant="body2" color="textSecondary">
                    ${item.meal.price.toFixed(2)} each
                  </DLSTypography>
                  <DLSTypography variant="body2" color="textSecondary">
                    From: {item.restaurantName}
                  </DLSTypography>
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
                    <DLSTypography
                      sx={{ mx: 2, minWidth: 20, textAlign: "center" }}
                    >
                      {item.quantity}
                    </DLSTypography>
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleQuantityChange(item.meal.id, item.quantity + 1)
                      }
                    >
                      <Add />
                    </IconButton>
                  </Box>

                  <DLSTypography
                    variant="h6"
                    sx={{ minWidth: 80, textAlign: "right" }}
                  >
                    ${(item.meal.price * item.quantity).toFixed(2)}
                  </DLSTypography>

                  <IconButton
                    color="error"
                    onClick={() => removeItem(item.meal.id)}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </DLSCard>
        ))}
      </Box>

      <DLSCard>
        <Box sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
            <DLSTypography variant="body1">Subtotal:</DLSTypography>
            <DLSTypography variant="body1">
              ${cartState.total.toFixed(2)}
            </DLSTypography>
          </Box>
          <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
            <DLSTypography variant="body1">Delivery Fee:</DLSTypography>
            <DLSTypography variant="body1">$3.99</DLSTypography>
          </Box>
          <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
            <DLSTypography variant="body1">Tax:</DLSTypography>
            <DLSTypography variant="body1">
              ${(cartState.total * 0.08).toFixed(2)}
            </DLSTypography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box display="flex" justifyContent="space-between" sx={{ mb: 3 }}>
            <DLSTypography variant="h6">Total:</DLSTypography>
            <DLSTypography variant="h6">
              ${(cartState.total + 3.99 + cartState.total * 0.08).toFixed(2)}
            </DLSTypography>
          </Box>

          <Box display="flex" gap={2}>
            <DLSButton
              variant="outlined"
              color="error"
              onClick={clearCart}
              sx={{ flex: 1 }}
            >
              Clear Cart
            </DLSButton>
            <DLSButton
              variant="contained"
              onClick={handleCheckout}
              sx={{ flex: 2 }}
            >
              Proceed to Checkout
            </DLSButton>
          </Box>
        </Box>
      </DLSCard>
    </Container>
  );
};
