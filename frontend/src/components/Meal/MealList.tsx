import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  CardMedia,
  Container,
  Chip,
  Alert,
} from "@mui/material";
import styled from "styled-components";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Fastfood } from "@mui/icons-material";
import { Meal } from "../../types/meal";
import { Restaurant } from "../../types/restaurant";
import { Loading } from "../Common/Loading";
import { SearchBar } from "../Common/SearchBar";
import { EmptyState } from "../Common/EmptyState";
import { useCart } from "../../contexts/CartContext";
import { DLSCard } from "../../dls/molecules/Card";
import { DLSTypography } from "../../dls/atoms/Typography";
import { DLSButton } from "../../dls/atoms/Button";

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
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
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
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
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
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
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
  const { addItem } = useCart();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [addToCartError, setAddToCartError] = useState<string | null>(null);

  useEffect(() => {
    const loadMeals = () => {
      setLoading(true);
      setTimeout(() => {
        setMeals(getMockMeals(restaurant.id));
        setLoading(false);
      }, 500);
    };

    loadMeals();
  }, [restaurant.id]);

  const filteredMeals = meals.filter(
    (meal) =>
      meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (meal.category &&
        meal.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddToCart = async (meal: Meal) => {
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
                flexDirection: "column"
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={meal.image}
                alt={meal.name}
                sx={{ objectFit: "cover" }}
              />
              <Box sx={{ p: 2, flexGrow: 1, display: "flex", flexDirection: "column" }}>
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
    </Container>
  );
};
