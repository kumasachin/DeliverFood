import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  LocalOffer,
  ContentCopy,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { DLSButton } from "dls/atoms/Button";
import { DLSTypography } from "dls/atoms/Typography";
import { apiService, Coupon, Restaurant } from "services/api";
import { useAuth } from "contexts/AuthContext";

interface CouponManagementProps {
  restaurantUuid?: string;
  onCouponChange?: () => void;
}

interface CouponFormData {
  coupon_code: string;
  percentage: number;
}

interface CouponFormErrors {
  coupon_code?: string;
  percentage?: string;
}

export const CouponManagement: React.FC<CouponManagementProps> = ({
  restaurantUuid,
  onCouponChange,
}) => {
  const { state: authState } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>(
    restaurantUuid || ""
  );
  const [formData, setFormData] = useState<CouponFormData>({
    coupon_code: "",
    percentage: 5,
  });
  const [formErrors, setFormErrors] = useState<CouponFormErrors>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showInactiveCoupons, setShowInactiveCoupons] = useState(false);

  const fetchRestaurants = useCallback(async () => {
    try {
      if (authState.user?.role === "owner") {
        const restaurantList = await apiService.getRestaurants({
          owner_uuid: authState.user.uuid,
        });
        setRestaurants(restaurantList);

        if (!restaurantUuid && restaurantList.length > 0) {
          setSelectedRestaurant(restaurantList[0].uuid);
        }
      }
    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
      setError("Failed to load restaurants");
    }
  }, [authState.user, restaurantUuid]);

  const fetchCoupons = useCallback(async () => {
    if (!selectedRestaurant) return;

    try {
      setLoading(true);
      setError(null);
      const couponList = await apiService.getRestaurantCoupons(
        selectedRestaurant
      );
      setCoupons(couponList);
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
      setError("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }, [selectedRestaurant]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const validateForm = (): boolean => {
    const errors: CouponFormErrors = {};

    if (!formData.coupon_code.trim()) {
      errors.coupon_code = "Coupon code is required";
    } else if (formData.coupon_code.length < 3) {
      errors.coupon_code = "Coupon code must be at least 3 characters";
    } else if (formData.coupon_code.length > 20) {
      errors.coupon_code = "Coupon code must be less than 20 characters";
    }

    if (!formData.percentage || formData.percentage < 1) {
      errors.percentage = "Percentage must be at least 1%";
    } else if (formData.percentage > 100) {
      errors.percentage = "Percentage cannot exceed 100%";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenDialog = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        coupon_code: coupon.coupon_code,
        percentage: coupon.percentage,
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        coupon_code: "",
        percentage: 5,
      });
    }
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCoupon(null);
    setFormErrors({});
  };

  const handleSubmit = async () => {
    if (!validateForm() || !selectedRestaurant) return;

    try {
      setActionLoading("saving");

      if (editingCoupon) {
        await apiService.updateCoupon(editingCoupon.uuid, {
          percentage: formData.percentage,
        });
      } else {
        await apiService.createCoupon(selectedRestaurant, formData);
      }

      await fetchCoupons();
      onCouponChange?.();
      handleCloseDialog();
    } catch (error: any) {
      console.error("Failed to save coupon:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to save coupon";
      setFormErrors({ coupon_code: errorMessage });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (couponUuid: string) => {
    try {
      setActionLoading(couponUuid);
      await apiService.deleteCoupon(couponUuid);
      await fetchCoupons();
      onCouponChange?.();
    } catch (error) {
      console.error("Failed to delete coupon:", error);
      setError("Failed to delete coupon");
    } finally {
      setActionLoading(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const filteredCoupons = coupons.filter(
    (coupon) => showInactiveCoupons || coupon.status === "active"
  );

  const selectedRestaurantName =
    restaurants.find((r) => r.uuid === selectedRestaurant)?.title || "";

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <LocalOffer sx={{ color: "primary.main" }} />
          <DLSTypography variant="h5">Coupon Management</DLSTypography>
        </Box>
        <DLSButton
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          disabled={!selectedRestaurant}
        >
          Create Coupon
        </DLSButton>
      </Box>

      {!restaurantUuid && restaurants.length > 1 && (
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Select Restaurant</InputLabel>
            <Select
              value={selectedRestaurant}
              onChange={(e) => setSelectedRestaurant(e.target.value)}
              label="Select Restaurant"
            >
              {restaurants.map((restaurant) => (
                <MenuItem key={restaurant.uuid} value={restaurant.uuid}>
                  {restaurant.title} - {restaurant.cuisine}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <Typography variant="body2">Show inactive coupons:</Typography>
        <IconButton
          onClick={() => setShowInactiveCoupons(!showInactiveCoupons)}
          color={showInactiveCoupons ? "primary" : "default"}
        >
          {showInactiveCoupons ? <Visibility /> : <VisibilityOff />}
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredCoupons.length === 0 ? (
        <Alert severity="info" sx={{ textAlign: "center" }}>
          {selectedRestaurant
            ? `No ${
                showInactiveCoupons ? "" : "active "
              }coupons found for ${selectedRestaurantName}`
            : "Please select a restaurant to view coupons"}
        </Alert>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 2,
          }}
        >
          {filteredCoupons.map((coupon) => (
            <Card
              key={coupon.uuid}
              sx={{
                border: coupon.status === "active" ? "2px solid" : "1px solid",
                borderColor:
                  coupon.status === "active" ? "success.main" : "grey.300",
                opacity: coupon.status === "active" ? 1 : 0.7,
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <DLSTypography variant="h6" sx={{ fontFamily: "monospace" }}>
                    {coupon.coupon_code}
                  </DLSTypography>
                  <Chip
                    label={coupon.status}
                    color={coupon.status === "active" ? "success" : "default"}
                    size="small"
                  />
                </Box>

                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <DLSTypography variant="h4" color="primary">
                    {coupon.percentage}%
                  </DLSTypography>
                  <DLSTypography variant="body2" color="textSecondary">
                    discount
                  </DLSTypography>
                </Box>

                <DLSTypography variant="body2" color="textSecondary">
                  Created: {new Date(coupon.created_at).toLocaleDateString()}
                </DLSTypography>
              </CardContent>

              <CardActions
                sx={{ justifyContent: "space-between", px: 2, pb: 2 }}
              >
                <Box>
                  <Tooltip title="Copy coupon code">
                    <IconButton
                      size="small"
                      onClick={() => copyToClipboard(coupon.coupon_code)}
                    >
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  {coupon.status === "active" && (
                    <Tooltip title="Edit percentage">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(coupon)}
                        disabled={actionLoading === coupon.uuid}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>

                <Tooltip title="Delete coupon">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(coupon.uuid)}
                    disabled={actionLoading === coupon.uuid}
                  >
                    {actionLoading === coupon.uuid ? (
                      <CircularProgress size={16} />
                    ) : (
                      <Delete fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
            <TextField
              label="Coupon Code"
              value={formData.coupon_code}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  coupon_code: e.target.value.toUpperCase(),
                })
              }
              error={!!formErrors.coupon_code}
              helperText={
                formErrors.coupon_code ||
                "Enter a unique coupon code (3-20 characters)"
              }
              disabled={!!editingCoupon}
              placeholder="SAVE10"
              fullWidth
            />

            <TextField
              label="Discount Percentage"
              type="number"
              value={formData.percentage}
              onChange={(e) =>
                setFormData({ ...formData, percentage: Number(e.target.value) })
              }
              error={!!formErrors.percentage}
              helperText={
                formErrors.percentage || "Enter discount percentage (1-100)"
              }
              inputProps={{ min: 1, max: 100 }}
              fullWidth
            />

            {selectedRestaurantName && (
              <Alert severity="info">
                This coupon will be created for: {selectedRestaurantName}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <DLSButton variant="outlined" onClick={handleCloseDialog}>
            Cancel
          </DLSButton>
          <DLSButton
            variant="contained"
            onClick={handleSubmit}
            disabled={actionLoading === "saving"}
            startIcon={
              actionLoading === "saving" ? (
                <CircularProgress size={16} />
              ) : undefined
            }
          >
            {editingCoupon ? "Update" : "Create"} Coupon
          </DLSButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
