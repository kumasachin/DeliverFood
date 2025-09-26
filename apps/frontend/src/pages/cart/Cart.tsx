import React, { useState } from "react";
import {
  Add,
  Remove,
  Delete,
  ShoppingCartOutlined,
  ShoppingCart,
  LocalOffer,
} from "@mui/icons-material";
import {
  TextField,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useCart } from "contexts/CartContext";
import { useAuth } from "contexts/AuthContext";
import { apiService, Coupon } from "services/api";
import { DLSTypography } from "dls/atoms/Typography";
import { DLSButton } from "dls/atoms/Button";
import { DLSCard } from "dls/molecules/Card";
import { Container, Box, IconButton, Alert, Divider } from "dls/atoms";
import CouponBrowser from "../../components/Coupon/CouponBrowser";

export const Cart = () => {
  const navigate = useNavigate();
  const { state: cartState, updateQuantity, removeItem, clearCart } = useCart();
  const { state: authState } = useAuth();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [tipAmount, setTipAmount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponBrowserOpen, setCouponBrowserOpen] = useState(false);

  const restaurantUuid =
    cartState.items.length > 0 ? cartState.items[0].restaurantId : null;

  const applyCoupon = async () => {
    if (!couponCode.trim() || !restaurantUuid) return;

    try {
      setCouponLoading(true);
      setCouponError(null);

      const coupons = await apiService.getRestaurantCoupons(restaurantUuid);
      const matchingCoupon = coupons.find(
        (coupon) =>
          coupon.coupon_code.toLowerCase() === couponCode.toLowerCase() &&
          coupon.status === "active"
      );

      if (matchingCoupon) {
        setAppliedCoupon(matchingCoupon);
      } else {
        setCouponError("Invalid or expired coupon code");
      }
    } catch (error) {
      setCouponError("Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
  };

  const handleCouponSelect = (coupon: Coupon) => {
    setAppliedCoupon(coupon);
    setCouponCode(coupon.coupon_code);
    setCouponError(null);
    setCouponBrowserOpen(false);
  };

  const calculateTotals = () => {
    const subtotal = cartState.total;
    const deliveryFee = 3.99;
    const tax = subtotal * 0.08;
    const discountAmount = appliedCoupon
      ? (subtotal * appliedCoupon.percentage) / 100
      : 0;
    const total = subtotal + deliveryFee + tax + tipAmount - discountAmount;

    return {
      subtotal,
      deliveryFee,
      tax,
      discountAmount,
      tipAmount,
      total: Math.max(total, 0),
    };
  };

  const totals = calculateTotals();

  if (!authState.isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning" data-testid="cart-auth-warning">
          Please sign in to view your cart.
        </Alert>
      </Container>
    );
  }

  if (cartState.items.length === 0) {
    return (
      <Container
        maxWidth="md"
        sx={{ py: 4 }}
        data-testid="empty-cart-container"
      >
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
          <DLSTypography
            variant="h5"
            gutterBottom
            data-testid="empty-cart-title"
          >
            Your cart is empty
          </DLSTypography>
          <DLSTypography
            variant="body1"
            color="textSecondary"
            sx={{ mb: 4 }}
            data-testid="empty-cart-message"
          >
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
          <DLSCard key={item.id} sx={{ mb: 2 }}>
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
                        handleQuantityChange(item.id, item.quantity - 1)
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
                        handleQuantityChange(item.id, item.quantity + 1)
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

                  <IconButton color="error" onClick={() => removeItem(item.id)}>
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
          <Box sx={{ mb: 3 }}>
            <DLSTypography
              variant="h6"
              sx={{ mb: 2, display: "flex", alignItems: "center" }}
            >
              <LocalOffer sx={{ mr: 1 }} />
              Apply Coupon
            </DLSTypography>

            {appliedCoupon ? (
              <Box sx={{ mb: 2 }}>
                <Chip
                  label={`${appliedCoupon.coupon_code} - ${appliedCoupon.percentage}% off`}
                  color="success"
                  onDelete={removeCoupon}
                  sx={{ mb: 1 }}
                />
                <DLSTypography variant="body2" sx={{ color: "success.main" }}>
                  You saved ${totals.discountAmount.toFixed(2)}!
                </DLSTypography>
              </Box>
            ) : (
              <Box>
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <TextField
                    size="small"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) =>
                      setCouponCode(e.target.value.toUpperCase())
                    }
                    disabled={couponLoading}
                    sx={{ flex: 1 }}
                  />
                  <DLSButton
                    variant="outlined"
                    onClick={applyCoupon}
                    disabled={!couponCode.trim() || couponLoading}
                    startIcon={
                      couponLoading ? <CircularProgress size={16} /> : undefined
                    }
                  >
                    Apply
                  </DLSButton>
                </Box>

                <Box sx={{ textAlign: "center" }}>
                  <DLSButton
                    variant="text"
                    size="small"
                    onClick={() => setCouponBrowserOpen(true)}
                    startIcon={<LocalOffer />}
                  >
                    Browse Available Coupons
                  </DLSButton>
                </Box>
              </Box>
            )}

            {couponError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {couponError}
              </Alert>
            )}
          </Box>

          <Box sx={{ mb: 3 }}>
            <DLSTypography variant="h6" sx={{ mb: 2 }}>
              Add Tip
            </DLSTypography>
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              {[0, 2, 3, 5].map((tip) => (
                <DLSButton
                  key={tip}
                  variant={tipAmount === tip ? "contained" : "outlined"}
                  size="small"
                  onClick={() => setTipAmount(tip)}
                >
                  ${tip}
                </DLSButton>
              ))}
            </Box>
            <TextField
              size="small"
              type="number"
              placeholder="Custom tip amount"
              value={tipAmount || ""}
              onChange={(e) => setTipAmount(Number(e.target.value) || 0)}
              inputProps={{ min: 0, step: 0.01 }}
              sx={{ width: "150px" }}
            />
          </Box>

          <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
            <DLSTypography variant="body1">Subtotal:</DLSTypography>
            <DLSTypography variant="body1">
              ${totals.subtotal.toFixed(2)}
            </DLSTypography>
          </Box>

          {appliedCoupon && (
            <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
              <DLSTypography variant="body1" sx={{ color: "success.main" }}>
                Discount ({appliedCoupon.percentage}%):
              </DLSTypography>
              <DLSTypography variant="body1" sx={{ color: "success.main" }}>
                -${totals.discountAmount.toFixed(2)}
              </DLSTypography>
            </Box>
          )}

          <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
            <DLSTypography variant="body1">Delivery Fee:</DLSTypography>
            <DLSTypography variant="body1">
              ${totals.deliveryFee.toFixed(2)}
            </DLSTypography>
          </Box>

          {tipAmount > 0 && (
            <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
              <DLSTypography variant="body1">Tip:</DLSTypography>
              <DLSTypography variant="body1">
                ${totals.tipAmount.toFixed(2)}
              </DLSTypography>
            </Box>
          )}

          <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
            <DLSTypography variant="body1">Tax:</DLSTypography>
            <DLSTypography variant="body1">
              ${totals.tax.toFixed(2)}
            </DLSTypography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box display="flex" justifyContent="space-between" sx={{ mb: 3 }}>
            <DLSTypography variant="h6">Total:</DLSTypography>
            <DLSTypography variant="h6">
              ${totals.total.toFixed(2)}
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

      <Dialog
        open={couponBrowserOpen}
        onClose={() => setCouponBrowserOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Available Coupons</DialogTitle>
        <DialogContent>
          <CouponBrowser
            restaurantUuid={restaurantUuid || undefined}
            onCouponSelect={handleCouponSelect}
            showSelectButton={true}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCouponBrowserOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
