import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Box,
  Alert,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  LocalOffer,
  Restaurant as RestaurantIcon,
  Refresh,
} from "@mui/icons-material";
import { useAuth } from "contexts/AuthContext";
import { apiService } from "services/api";
import { DLSTypography } from "dls/atoms/Typography";
import { DLSButton } from "dls/atoms/Button";
import { DLSCard } from "dls/molecules/Card";

interface Coupon {
  uuid: string;
  coupon_code: string;
  percentage: number;
  restaurant_uuid: string;
  status: string;
  created_at: string;
}

interface Restaurant {
  uuid: string;
  title: string;
  description: string;
  cuisine: string;
  owner_uuid: string;
  created_at: string;
  coordinates: {
    lat: string;
    lng: string;
  };
}

interface CouponForm {
  coupon_code: string;
  percentage: number;
  restaurant_uuid: string;
}

export const CouponManagement = () => {
  const { state: authState } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<CouponForm>({
    coupon_code: "",
    percentage: 0,
    restaurant_uuid: "",
  });

  // Fetch user's restaurants
  const fetchRestaurants = useCallback(async () => {
    if (!authState.user || authState.user.role !== "owner") {
      setError("Access denied. Restaurant owner account required.");
      return;
    }

    try {
      setLoading(true);
      const restaurantsData = await apiService.getRestaurants({});
      // Filter restaurants owned by current user
      const ownedRestaurants = restaurantsData.filter(
        (restaurant) => restaurant.owner_uuid === authState.user?.uuid
      );
      setRestaurants(ownedRestaurants);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load restaurants");
    } finally {
      setLoading(false);
    }
  }, [authState.user]);

  // Fetch coupons for all user's restaurants
  const fetchCoupons = useCallback(async () => {
    if (restaurants.length === 0) return;

    try {
      setLoading(true);
      const allCoupons: Coupon[] = [];

      for (const restaurant of restaurants) {
        try {
          const restaurantCoupons = await apiService.getRestaurantCoupons(
            restaurant.uuid
          );
          allCoupons.push(...restaurantCoupons);
        } catch (err) {
          // Continue with other restaurants if one fails
          console.warn(
            `Failed to fetch coupons for restaurant ${restaurant.title}`
          );
        }
      }

      setCoupons(allCoupons);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }, [restaurants]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  useEffect(() => {
    if (restaurants.length > 0) {
      fetchCoupons();
    }
  }, [restaurants, fetchCoupons]);

  const handleCreateCoupon = () => {
    setEditingCoupon(null);
    setFormData({
      coupon_code: "",
      percentage: 0,
      restaurant_uuid: restaurants.length > 0 ? restaurants[0].uuid : "",
    });
    setIsDialogOpen(true);
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      coupon_code: coupon.coupon_code,
      percentage: coupon.percentage,
      restaurant_uuid: coupon.restaurant_uuid,
    });
    setIsDialogOpen(true);
  };

  const handleSaveCoupon = async () => {
    try {
      setError(null);

      if (editingCoupon) {
        // Update coupon
        await apiService.updateCoupon(editingCoupon.uuid, {
          percentage: formData.percentage,
        });
      } else {
        // Create new coupon
        await apiService.createCoupon(formData.restaurant_uuid, {
          coupon_code: formData.coupon_code,
          percentage: formData.percentage,
        });
      }

      setIsDialogOpen(false);
      fetchCoupons();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save coupon");
    }
  };

  const handleDeleteCoupon = async (couponUuid: string) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) {
      return;
    }

    try {
      setError(null);
      await apiService.deleteCoupon(couponUuid);
      fetchCoupons();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete coupon");
    }
  };

  const getRestaurantName = (restaurantUuid: string) => {
    const restaurant = restaurants.find((r) => r.uuid === restaurantUuid);
    return restaurant?.title || "Unknown Restaurant";
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!authState.user || authState.user.role !== "owner") {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Access denied. Restaurant owner account required.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <DLSTypography variant="h4" component="h1" gutterBottom sx={{ mb: 0 }}>
          <LocalOffer sx={{ mr: 1, verticalAlign: "middle" }} />
          Coupon Management
        </DLSTypography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <DLSButton
            variant="outlined"
            startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}
            onClick={fetchCoupons}
            disabled={loading}
          >
            Refresh
          </DLSButton>
          <DLSButton
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateCoupon}
            disabled={restaurants.length === 0}
          >
            Create Coupon
          </DLSButton>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {restaurants.length === 0 && !loading && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You need to create a restaurant first before creating coupons.
        </Alert>
      )}

      <DLSCard>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Restaurant</TableCell>
                  <TableCell>Coupon Code</TableCell>
                  <TableCell>Discount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : coupons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <DLSTypography variant="body2" color="textSecondary">
                        No coupons found. Create your first coupon!
                      </DLSTypography>
                    </TableCell>
                  </TableRow>
                ) : (
                  coupons.map((coupon) => (
                    <TableRow key={coupon.uuid}>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <RestaurantIcon
                            sx={{ mr: 1, color: "primary.main" }}
                          />
                          {getRestaurantName(coupon.restaurant_uuid)}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={coupon.coupon_code}
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <DLSTypography
                          variant="h6"
                          sx={{ color: "success.main" }}
                        >
                          {coupon.percentage}%
                        </DLSTypography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={coupon.status}
                          color={
                            coupon.status === "active" ? "success" : "default"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(coupon.created_at)}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => handleEditCoupon(coupon)}
                          disabled={coupon.status !== "active"}
                          size="small"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteCoupon(coupon.uuid)}
                          disabled={coupon.status !== "active"}
                          size="small"
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </DLSCard>

      {/* Create/Edit Coupon Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Restaurant</InputLabel>
              <Select
                value={formData.restaurant_uuid}
                onChange={(e) =>
                  setFormData({ ...formData, restaurant_uuid: e.target.value })
                }
                disabled={!!editingCoupon}
                label="Restaurant"
              >
                {restaurants.map((restaurant) => (
                  <MenuItem key={restaurant.uuid} value={restaurant.uuid}>
                    {restaurant.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Coupon Code"
              value={formData.coupon_code}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  coupon_code: e.target.value.toUpperCase(),
                })
              }
              disabled={!!editingCoupon}
              placeholder="e.g., DISCOUNT20"
              helperText="Enter a unique coupon code (will be converted to uppercase)"
            />

            <TextField
              fullWidth
              label="Discount Percentage"
              type="number"
              value={formData.percentage}
              onChange={(e) =>
                setFormData({ ...formData, percentage: Number(e.target.value) })
              }
              inputProps={{ min: 1, max: 100 }}
              helperText="Enter percentage discount (1-100)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <DLSButton onClick={() => setIsDialogOpen(false)}>Cancel</DLSButton>
          <DLSButton
            onClick={handleSaveCoupon}
            variant="contained"
            disabled={
              !formData.coupon_code ||
              formData.percentage <= 0 ||
              formData.percentage > 100 ||
              !formData.restaurant_uuid
            }
          >
            {editingCoupon ? "Update" : "Create"}
          </DLSButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
