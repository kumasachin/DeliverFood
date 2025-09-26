import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Restaurant as RestaurantIcon,
  LocationOn as LocationIcon,
  LocalOffer as CouponIcon,
} from "@mui/icons-material";
import { useAuth } from "contexts/AuthContext";
import { apiService, Restaurant } from "services/api";
import { CouponManagement } from "components/Coupon/CouponManagement";

interface RestaurantForm {
  title: string;
  description: string;
  cuisine: string;
  coordinates: {
    lat: string;
    lng: string;
  };
}

const CUISINES = [
  "italian",
  "french",
  "chinese",
  "japanese",
  "indian",
  "mexican",
  "greek",
];

const CUISINE_NAMES = {
  italian: "Italian",
  french: "French",
  chinese: "Chinese",
  japanese: "Japanese",
  indian: "Indian",
  mexican: "Mexican",
  greek: "Greek",
};

export const RestaurantManagement = () => {
  const { state: authState } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const [formData, setFormData] = useState<RestaurantForm>({
    title: "",
    description: "",
    cuisine: "",
    coordinates: {
      lat: "",
      lng: "",
    },
  });

  useEffect(() => {
    const loadRestaurants = async () => {
      if (authState.user?.role !== "owner") return;

      try {
        setLoading(true);
        const response = await apiService.getRestaurants({
          owner_uuid: authState.user.uuid,
        });
        setRestaurants(response);
      } catch (err) {
        setError("Failed to load restaurants");
      } finally {
        setLoading(false);
      }
    };

    loadRestaurants();
  }, [authState.user]);

  const handleOpenDialog = (restaurant?: Restaurant) => {
    if (restaurant) {
      setEditingRestaurant(restaurant);
      setFormData({
        title: restaurant.title,
        description: restaurant.description,
        cuisine: restaurant.cuisine,
        coordinates: {
          lat: restaurant.coordinates?.lat || "",
          lng: restaurant.coordinates?.lng || "",
        },
      });
    } else {
      setEditingRestaurant(null);
      setFormData({
        title: "",
        description: "",
        cuisine: "",
        coordinates: {
          lat: "",
          lng: "",
        },
      });
    }
    setDialogOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingRestaurant(null);
    setError(null);
  };

  const updateForm = (field: string, value: string) => {
    if (field.startsWith("coordinates.")) {
      const coordField = field.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        coordinates: { ...prev.coordinates, [coordField]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Restaurant name is required");
      return false;
    }
    if (!formData.description.trim()) {
      setError("Description is required");
      return false;
    }
    if (!formData.cuisine) {
      setError("Cuisine type is required");
      return false;
    }
    if (!formData.coordinates.lat || !formData.coordinates.lng) {
      setError("Coordinates are required");
      return false;
    }
    if (
      isNaN(parseFloat(formData.coordinates.lat)) ||
      isNaN(parseFloat(formData.coordinates.lng))
    ) {
      setError("Coordinates must be valid numbers");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const restaurantData: Omit<
        Restaurant,
        "uuid" | "created_at" | "owner_uuid"
      > = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        cuisine: formData.cuisine,
        coordinates: {
          lat: formData.coordinates.lat,
          lng: formData.coordinates.lng,
        },
      };

      let updatedRestaurant: Restaurant;

      if (editingRestaurant) {
        updatedRestaurant = await apiService.updateRestaurant(
          editingRestaurant.uuid,
          restaurantData
        );
        setRestaurants((prev) =>
          prev.map((r) =>
            r.uuid === editingRestaurant.uuid ? updatedRestaurant : r
          )
        );
        setSuccess("Restaurant updated successfully!");
      } else {
        updatedRestaurant = await apiService.createRestaurant(restaurantData);
        setRestaurants((prev) => [...prev, updatedRestaurant]);
        setSuccess("Restaurant created successfully!");
      }

      handleCloseDialog();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        `Failed to ${editingRestaurant ? "update" : "create"} restaurant`;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (restaurant: Restaurant) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${restaurant.title}"? This will also delete all associated meals and orders.`
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await apiService.deleteRestaurant(restaurant.uuid);
      setRestaurants((prev) => prev.filter((r) => r.uuid !== restaurant.uuid));
      setSuccess("Restaurant deleted successfully!");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete restaurant");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            coordinates: {
              lat: position.coords.latitude.toString(),
              lng: position.coords.longitude.toString(),
            },
          }));
          setSuccess("Location detected successfully!");
        },
        (error) => {
          setError(
            "Failed to get current location. Please enter coordinates manually."
          );
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };

  if (authState.user?.role !== "owner") {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          Access denied. Only restaurant owners can manage restaurants.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <RestaurantIcon sx={{ mr: 2, fontSize: 32 }} />
        <Typography variant="h4" component="h1">
          Restaurant Management
        </Typography>
      </Box>

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
        >
          <Tab
            label="Restaurants"
            icon={<RestaurantIcon />}
            iconPosition="start"
          />
          <Tab label="Coupons" icon={<CouponIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Box>
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              disabled={loading}
            >
              Add New Restaurant
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : restaurants.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No Restaurants Found
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Create your first restaurant to get started.
              </Typography>
            </Paper>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              {restaurants.map((restaurant) => (
                <Card
                  key={restaurant.uuid}
                  sx={{ display: "flex", flexDirection: "column" }}
                >
                  <CardContent sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h5" component="h2" gutterBottom>
                          {restaurant.title}
                        </Typography>
                        <Typography
                          variant="body1"
                          color="textSecondary"
                          paragraph
                        >
                          {restaurant.description}
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 2,
                            alignItems: "center",
                          }}
                        >
                          <Chip
                            label={
                              CUISINE_NAMES[
                                restaurant.cuisine as keyof typeof CUISINE_NAMES
                              ] || restaurant.cuisine
                            }
                            color="primary"
                            variant="outlined"
                          />

                          {restaurant.coordinates && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <LocationIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="textSecondary">
                                {restaurant.coordinates.lat},{" "}
                                {restaurant.coordinates.lng}
                              </Typography>
                            </Box>
                          )}

                          <Typography variant="body2" color="textSecondary">
                            Created:{" "}
                            {new Date(
                              restaurant.created_at
                            ).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ justifyContent: "flex-end", p: 2 }}>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(restaurant)}
                      disabled={loading}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(restaurant)}
                      disabled={loading}
                      color="error"
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      )}

      {activeTab === 1 && (
        <CouponManagement
          onCouponChange={() => {
            setSuccess("Coupon updated successfully!");
          }}
        />
      )}

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingRestaurant ? "Edit Restaurant" : "Add New Restaurant"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Restaurant Name"
              value={formData.title}
              onChange={(e) => updateForm("title", e.target.value)}
              required
              inputProps={{ maxLength: 30 }}
              helperText={`${formData.title.length}/30 characters`}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => updateForm("description", e.target.value)}
              multiline
              rows={3}
              required
              inputProps={{ maxLength: 80 }}
              helperText={`${formData.description.length}/80 characters`}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Cuisine Type</InputLabel>
              <Select
                value={formData.cuisine}
                label="Cuisine Type"
                onChange={(e) => updateForm("cuisine", e.target.value)}
                required
              >
                {CUISINES.map((cuisine) => (
                  <MenuItem key={cuisine} value={cuisine}>
                    {CUISINE_NAMES[cuisine as keyof typeof CUISINE_NAMES]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", mt: 3 }}
            >
              <LocationIcon sx={{ mr: 1 }} />
              Location Coordinates
            </Typography>
            <Button
              variant="outlined"
              onClick={getCurrentLocation}
              sx={{ mb: 2 }}
              startIcon={<LocationIcon />}
            >
              Use Current Location
            </Button>

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Latitude"
                value={formData.coordinates.lat}
                onChange={(e) => updateForm("coordinates.lat", e.target.value)}
                required
                type="number"
                inputProps={{ step: "any" }}
                placeholder="e.g. 37.7749"
                sx={{ flex: 1 }}
              />

              <TextField
                label="Longitude"
                value={formData.coordinates.lng}
                onChange={(e) => updateForm("coordinates.lng", e.target.value)}
                required
                type="number"
                inputProps={{ step: "any" }}
                placeholder="e.g. -122.4194"
                sx={{ flex: 1 }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {editingRestaurant ? "Update" : "Create"} Restaurant
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
