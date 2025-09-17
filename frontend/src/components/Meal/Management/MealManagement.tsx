import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
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
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Restaurant as RestaurantIcon,
  AttachMoney as MoneyIcon,
} from "@mui/icons-material";
import { useAuth } from "../../../contexts/AuthContext";
import { apiService } from "../../../services/api";
import { Meal } from "../../../types/meal";
import { Restaurant } from "../../../services/api";

interface MealFormData {
  name: string;
  description: string;
  price: number;
  category: string;
}

const MEAL_CATEGORIES = [
  "Appetizer",
  "Main Course",
  "Dessert",
  "Beverage",
  "Soup",
  "Salad",
  "Pasta",
  "Pizza",
  "Burger",
  "Sandwich",
  "Curry",
  "Rice",
  "Noodles",
  "Seafood",
  "Vegetarian",
  "Vegan",
];

export const MealManagement = () => {
  const { state: authState } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<MealFormData>({
    name: "",
    description: "",
    price: 0,
    category: "",
  });

  // Load owner's restaurants
  useEffect(() => {
    const loadRestaurants = async () => {
      if (authState.user?.role !== "owner") return;

      try {
        setLoading(true);
        const response = await apiService.getRestaurants({
          owner_uuid: authState.user.uuid,
        });
        setRestaurants(response);

        // Auto-select first restaurant if only one
        if (response.length === 1) {
          setSelectedRestaurant(response[0].uuid);
        }
      } catch (err) {
        setError("Failed to load restaurants");
        console.error("Error loading restaurants:", err);
      } finally {
        setLoading(false);
      }
    };

    loadRestaurants();
  }, [authState.user]);

  // Load meals for selected restaurant
  useEffect(() => {
    const loadMeals = async () => {
      if (!selectedRestaurant) {
        setMeals([]);
        return;
      }

      try {
        setLoading(true);
        const response = await apiService.getRestaurantMeals(
          selectedRestaurant
        );
        setMeals(response);
      } catch (err) {
        setError("Failed to load meals");
        console.error("Error loading meals:", err);
      } finally {
        setLoading(false);
      }
    };

    loadMeals();
  }, [selectedRestaurant]);

  const handleOpenDialog = (meal?: Meal) => {
    if (meal) {
      setEditingMeal(meal);
      setFormData({
        name: meal.name,
        description: meal.description || "",
        price: meal.price,
        category: meal.category || "",
      });
    } else {
      setEditingMeal(null);
      setFormData({
        name: "",
        description: "",
        price: 0,
        category: "",
      });
    }
    setDialogOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMeal(null);
    setError(null);
  };

  const handleInputChange = (
    field: keyof MealFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedRestaurant) {
      setError("Please select a restaurant first");
      return;
    }

    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      formData.price <= 0
    ) {
      setError("Please fill in all required fields with valid values");
      return;
    }

    try {
      setLoading(true);

      const mealData: Omit<
        Meal,
        "id" | "uuid" | "restaurantId" | "restaurantUuid"
      > = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: formData.price,
        category: formData.category,
        available: true,
      };

      let updatedMeal: Meal;

      if (editingMeal) {
        // Update existing meal
        updatedMeal = await apiService.updateMeal(
          editingMeal.uuid || editingMeal.id,
          mealData
        );
        setMeals((prev) =>
          prev.map((m) =>
            (m.uuid || m.id) === (editingMeal.uuid || editingMeal.id)
              ? updatedMeal
              : m
          )
        );
        setSuccess("Meal updated successfully!");
      } else {
        // Create new meal
        updatedMeal = await apiService.createMeal(selectedRestaurant, mealData);
        setMeals((prev) => [...prev, updatedMeal]);
        setSuccess("Meal created successfully!");
      }

      handleCloseDialog();
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          `Failed to ${editingMeal ? "update" : "create"} meal`
      );
      console.error("Error saving meal:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (meal: Meal) => {
    if (!window.confirm(`Are you sure you want to delete "${meal.name}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await apiService.deleteMeal(meal.uuid || meal.id);
      setMeals((prev) =>
        prev.filter((m) => (m.uuid || m.id) !== (meal.uuid || meal.id))
      );
      setSuccess("Meal deleted successfully!");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete meal");
      console.error("Error deleting meal:", err);
    } finally {
      setLoading(false);
    }
  };

  if (authState.user?.role !== "owner") {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          Access denied. Only restaurant owners can manage meals.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <RestaurantIcon sx={{ mr: 2, fontSize: 32 }} />
        <Typography variant="h4" component="h1">
          Meal Management
        </Typography>
      </Box>

      {/* Success/Error Messages */}
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

      {/* Restaurant Selection */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select Restaurant
        </Typography>
        <FormControl fullWidth>
          <InputLabel>Restaurant</InputLabel>
          <Select
            value={selectedRestaurant}
            label="Restaurant"
            onChange={(e) => setSelectedRestaurant(e.target.value)}
            disabled={loading}
          >
            {restaurants.map((restaurant) => (
              <MenuItem key={restaurant.uuid} value={restaurant.uuid}>
                {restaurant.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {restaurants.length === 0 && !loading && (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            No restaurants found. Please create a restaurant first.
          </Typography>
        )}
      </Paper>

      {/* Add Meal Button */}
      {selectedRestaurant && (
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            disabled={loading}
          >
            Add New Meal
          </Button>
        </Box>
      )}

      {/* Meals Table */}
      {selectedRestaurant && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
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
              ) : meals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="textSecondary">
                      No meals found. Add your first meal to get started.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                meals.map((meal) => (
                  <TableRow key={meal.uuid || meal.id}>
                    <TableCell>
                      <Typography variant="subtitle2">{meal.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {meal.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        ${meal.price.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {meal.category && (
                        <Chip
                          label={meal.category}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={meal.available ? "Available" : "Unavailable"}
                        size="small"
                        color={meal.available ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(meal)}
                        disabled={loading}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(meal)}
                        disabled={loading}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Meal Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{editingMeal ? "Edit Meal" : "Add New Meal"}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Meal Name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              margin="normal"
              multiline
              rows={3}
              required
            />

            <TextField
              fullWidth
              label="Price"
              type="number"
              value={formData.price}
              onChange={(e) =>
                handleInputChange("price", parseFloat(e.target.value) || 0)
              }
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MoneyIcon />
                  </InputAdornment>
                ),
                inputProps: { min: 0, step: 0.01 },
              }}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) => handleInputChange("category", e.target.value)}
              >
                {MEAL_CATEGORIES.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
            {editingMeal ? "Update" : "Create"} Meal
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
