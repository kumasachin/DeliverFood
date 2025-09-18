import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Fastfood } from "@mui/icons-material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { Meal } from "types/meal";
import { Restaurant } from "types/restaurant";
import { Loading } from "components/Common/Loading";
import { SearchBar } from "components/Common/SearchBar";
import { EmptyState } from "components/Common/EmptyState";
import { useCart } from "contexts/CartContext";
import { DLSCard } from "dls/molecules/Card";
import { apiService } from "services/api";
import { DLSTypography } from "dls/atoms/Typography";
import { DLSButton } from "dls/atoms/Button";
import { Box, CardMedia, Container, Chip, Alert } from "dls/atoms";

type MealListProps = {
  restaurant: Restaurant;
  onBackToRestaurants?: () => void;
};

const MealsGrid = styled(Box)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 16px;
`;

const getMockMeals = (restaurantId: string): Meal[] => [
  {
    id: "1",
    name: "Chicken Biryani",
    description:
      "Aromatic basmati rice cooked with tender chicken and traditional spices.",
    price: 12.99,
    image: "/assets/meals/meal.png",
    category: "Rice",
    restaurantId,
    available: true,
  },
  {
    id: "2",
    name: "Butter Chicken",
    description:
      "Creamy tomato-based curry with tender chicken pieces and aromatic spices.",
    price: 15.99,
    image: "/assets/meals/burger.png",
    category: "Curry",
    restaurantId,
    available: true,
  },
  {
    id: "3",
    name: "Palak Paneer",
    description:
      "Fresh spinach curry with cottage cheese cubes in a rich, creamy sauce.",
    price: 11.99,
    image: "/assets/meals/lunch.png",
    category: "Vegetarian",
    restaurantId,
    available: true,
  },
];

export const MealList = ({
  restaurant,
  onBackToRestaurants,
}: MealListProps) => {
  const navigate = useNavigate();
  const { addItem, clearCart, state: cartState } = useCart();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [addToCartError, setAddToCartError] = useState<string | null>(null);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [pendingMeal, setPendingMeal] = useState<Meal | null>(null);

  useEffect(() => {
    const loadMeals = async () => {
      setLoading(true);
      try {
        const realMeals = await apiService.getRestaurantMeals(
          restaurant.uuid || restaurant.id
        );
        if (realMeals && realMeals.length > 0) {
          setMeals(realMeals);
        } else {
          setMeals(getMockMeals(restaurant.id));
        }
      } catch (error) {
        setMeals(getMockMeals(restaurant.id));
      } finally {
        setLoading(false);
      }
    };

    loadMeals();
  }, [restaurant.id, restaurant.uuid]);

  const filteredMeals = meals.filter(
    (meal) =>
      meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (meal.category &&
        meal.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddToCart = async (meal: Meal) => {
    if (
      cartState.restaurantId &&
      cartState.restaurantId !== meal.restaurantId
    ) {
      setPendingMeal(meal);
      setShowConflictDialog(true);
      return;
    }

    try {
      const success = await addItem(meal, meal.restaurantId, restaurant.name);
      if (success) {
        setAddToCartError(null);
      } else {
        setAddToCartError(
          "Cannot add items from different restaurants to cart"
        );
      }
    } catch (err) {
      setAddToCartError("Failed to add item to cart");
    }
  };

  const handleConfirmNewRestaurant = async () => {
    if (pendingMeal) {
      clearCart();
      await addItem(pendingMeal, pendingMeal.restaurantId, restaurant.name);
      setShowConflictDialog(false);
      setPendingMeal(null);
      setAddToCartError(null);
    }
  };

  const handleCancelNewRestaurant = () => {
    setShowConflictDialog(false);
    setPendingMeal(null);
  };

  const handleBackToRestaurants = () => {
    onBackToRestaurants?.();
    navigate("/restaurants");
  };

  if (loading) {
    return <Loading message="Loading menu..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {addToCartError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setAddToCartError(null)}
        >
          {addToCartError}
        </Alert>
      )}

      <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
        <DLSButton
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToRestaurants}
          sx={{ mr: 2 }}
        >
          Back to Restaurants
        </DLSButton>
        <Fastfood sx={{ mr: 2 }} />
        <DLSTypography variant="h4" component="h1">
          {restaurant.name} - Menu
        </DLSTypography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <DLSTypography variant="body1" color="textSecondary">
          {restaurant.description}
        </DLSTypography>
        <Box display="flex" gap={2} sx={{ mt: 1 }}>
          <Chip label={`⭐ ${restaurant.rating}`} size="small" />
          <Chip
            label={restaurant.deliveryTime}
            size="small"
            variant="outlined"
          />
          <Chip label={restaurant.category} size="small" variant="outlined" />
        </Box>
      </Box>

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search meals..."
      />

      {filteredMeals.length === 0 ? (
        <EmptyState message="No meals found matching your search." />
      ) : (
        <MealsGrid>
          {filteredMeals.map((meal) => (
            <DLSCard
              key={meal.id}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={meal.image}
                alt={meal.name}
                sx={{ objectFit: "cover" }}
              />
              <Box
                sx={{
                  p: 2,
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <DLSTypography variant="h6" component="h2" gutterBottom>
                  {meal.name}
                </DLSTypography>
                <DLSTypography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mb: 2, flexGrow: 1 }}
                >
                  {meal.description}
                </DLSTypography>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <DLSTypography variant="h6" color="primary">
                    ${meal.price.toFixed(2)}
                  </DLSTypography>
                  <Chip label={meal.category} size="small" variant="outlined" />
                </Box>
                <DLSButton
                  fullWidth
                  variant="contained"
                  startIcon={<AddShoppingCartIcon />}
                  onClick={() => handleAddToCart(meal)}
                  disabled={!meal.available}
                >
                  {meal.available ? "Add to Cart" : "Not Available"}
                </DLSButton>
              </Box>
            </DLSCard>
          ))}
        </MealsGrid>
      )}

      <Dialog
        open={showConflictDialog}
        onClose={handleCancelNewRestaurant}
        aria-labelledby="conflict-dialog-title"
      >
        <DialogTitle id="conflict-dialog-title">Switch Restaurant?</DialogTitle>
        <DialogContent>
          <DLSTypography>
            Your cart contains items from a different restaurant. Would you like
            to clear your cart and start ordering from {restaurant.name}?
          </DLSTypography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelNewRestaurant} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmNewRestaurant}
            color="primary"
            variant="contained"
          >
            Clear Cart & Continue
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
