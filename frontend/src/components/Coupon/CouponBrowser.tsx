import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  LocalOffer,
  Search,
  ContentCopy,
  Store,
  Timer,
} from "@mui/icons-material";
import { DLSButton } from "dls/atoms/Button";
import { DLSTypography } from "dls/atoms/Typography";
import { apiService, Coupon, Restaurant } from "services/api";

interface CouponBrowserProps {
  restaurantUuid?: string;
  onCouponSelect?: (coupon: Coupon) => void;
  showSelectButton?: boolean;
}

const CouponBrowser: React.FC<CouponBrowserProps> = ({
  restaurantUuid,
  onCouponSelect,
  showSelectButton = false,
}) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [restaurants, setRestaurants] = useState<Record<string, Restaurant>>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch coupons
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        setError(null);

        if (restaurantUuid) {
          // Fetch coupons for specific restaurant
          const restaurantCoupons = await apiService.getRestaurantCoupons(
            restaurantUuid
          );
          setCoupons(restaurantCoupons.filter((c) => c.status === "active"));
        } else {
          // Fetch all restaurants and their coupons
          const allRestaurants = await apiService.getRestaurants();
          const restaurantMap: Record<string, Restaurant> = {};
          const allCoupons: Coupon[] = [];

          for (const restaurant of allRestaurants) {
            restaurantMap[restaurant.uuid] = restaurant;
            try {
              const restaurantCoupons = await apiService.getRestaurantCoupons(
                restaurant.uuid
              );
              allCoupons.push(
                ...restaurantCoupons.filter((c) => c.status === "active")
              );
            } catch (error) {
              // Restaurant might not have coupons, continue
              console.log(`No coupons for restaurant ${restaurant.title}`);
            }
          }

          setRestaurants(restaurantMap);
          setCoupons(allCoupons);
        }
      } catch (error) {
        console.error("Failed to fetch coupons:", error);
        setError("Failed to load available coupons");
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, [restaurantUuid]);

  const filteredCoupons = coupons.filter((coupon) => {
    if (!searchTerm) return true;
    const restaurant = restaurants[coupon.restaurant_uuid];
    return (
      coupon.coupon_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant?.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleCouponDetails = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setDetailsOpen(true);
  };

  const handleSelectCoupon = (coupon: Coupon) => {
    onCouponSelect?.(coupon);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <LocalOffer sx={{ mr: 2, color: "primary.main" }} />
        <DLSTypography variant="h5">
          {restaurantUuid ? "Restaurant Coupons" : "Available Coupons"}
        </DLSTypography>
      </Box>

      <TextField
        fullWidth
        placeholder="Search coupons or restaurants..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

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
          {searchTerm
            ? "No coupons found matching your search"
            : "No active coupons available at the moment"}
        </Alert>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 3,
          }}
        >
          {filteredCoupons.map((coupon) => {
            const restaurant = restaurants[coupon.restaurant_uuid];
            return (
              <Card
                key={coupon.uuid}
                sx={{
                  position: "relative",
                  border: "2px solid",
                  borderColor: "success.main",
                  "&:hover": {
                    boxShadow: 4,
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.2s ease-in-out",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    right: -8,
                    transform: "translateY(-50%)",
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    backgroundColor: "background.default",
                    border: "2px solid",
                    borderColor: "success.main",
                  }}
                />

                <CardContent sx={{ p: 3 }}>
                  {restaurant && (
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Store
                        fontSize="small"
                        sx={{ mr: 1, color: "text.secondary" }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {restaurant.title}
                      </Typography>
                      <Chip
                        label={restaurant.cuisine}
                        size="small"
                        variant="outlined"
                        sx={{ ml: "auto" }}
                      />
                    </Box>
                  )}

                  {/* Coupon Code */}
                  <Box sx={{ textAlign: "center", mb: 3 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontFamily: "monospace",
                        fontWeight: "bold",
                        border: "2px dashed",
                        borderColor: "primary.main",
                        borderRadius: 1,
                        p: 2,
                        backgroundColor: "primary.light",
                        color: "primary.contrastText",
                      }}
                    >
                      {coupon.coupon_code}
                    </Typography>
                  </Box>

                  {/* Discount */}
                  <Box sx={{ textAlign: "center", mb: 3 }}>
                    <Typography
                      variant="h2"
                      color="success.main"
                      sx={{ fontWeight: "bold" }}
                    >
                      {coupon.percentage}%
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      OFF YOUR ORDER
                    </Typography>
                  </Box>

                  {/* Valid Date */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                    }}
                  >
                    <Timer
                      fontSize="small"
                      sx={{ mr: 1, color: "text.secondary" }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Valid from{" "}
                      {new Date(coupon.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>

                  {/* Action Buttons */}
                  <Box
                    sx={{ display: "flex", gap: 1, justifyContent: "center" }}
                  >
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<ContentCopy />}
                      onClick={() => copyToClipboard(coupon.coupon_code)}
                    >
                      Copy Code
                    </Button>

                    <Button
                      variant="text"
                      size="small"
                      onClick={() => handleCouponDetails(coupon)}
                    >
                      Details
                    </Button>

                    {showSelectButton && (
                      <DLSButton
                        variant="contained"
                        size="small"
                        onClick={() => handleSelectCoupon(coupon)}
                      >
                        Use Coupon
                      </DLSButton>
                    )}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Coupon Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Coupon Details</DialogTitle>
        <DialogContent>
          {selectedCoupon && (
            <Box sx={{ pt: 1 }}>
              <Typography
                variant="h6"
                sx={{ mb: 2, textAlign: "center", fontFamily: "monospace" }}
              >
                {selectedCoupon.coupon_code}
              </Typography>

              {restaurants[selectedCoupon.restaurant_uuid] && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Restaurant:
                  </Typography>
                  <Typography variant="body1">
                    {restaurants[selectedCoupon.restaurant_uuid].title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cuisine:{" "}
                    {restaurants[selectedCoupon.restaurant_uuid].cuisine}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Discount:
                </Typography>
                <Typography variant="h5" color="success.main">
                  {selectedCoupon.percentage}% OFF
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Status:
                </Typography>
                <Chip
                  label={selectedCoupon.status}
                  color="success"
                  size="small"
                />
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Valid from:
                </Typography>
                <Typography variant="body1">
                  {new Date(selectedCoupon.created_at).toLocaleDateString()}{" "}
                  onwards
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          {selectedCoupon && (
            <Button
              variant="contained"
              startIcon={<ContentCopy />}
              onClick={() => {
                copyToClipboard(selectedCoupon.coupon_code);
                setDetailsOpen(false);
              }}
            >
              Copy Code
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CouponBrowser;
