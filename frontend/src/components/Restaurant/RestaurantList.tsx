import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CardMedia, Container } from "@mui/material";
import { Restaurant as RestaurantIcon } from "@mui/icons-material";
import styled from "styled-components";
import { Restaurant } from "types/restaurant";
import { Loading } from "../Common/Loading";
import { SearchBar } from "../Common/SearchBar";
import { EmptyState } from "../Common/EmptyState";
import { useSearchFilter } from "hooks";
import { DLSCard } from "dls/molecules/Card";
import { DLSTypography } from "dls/atoms/Typography";

type RestaurantListProps = {
  onSelectRestaurant?: (restaurant: Restaurant) => void;
};

const RestaurantsGrid = styled(Box)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 16px;
`;

const mockRestaurants: Restaurant[] = [
  {
    id: "1",
    name: "Spice Garden",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    image: "/assets/restaurants/restaurant.png",
    rating: 4.5,
    deliveryTime: "30-45 min",
    category: "North Indian",
  },
  {
    id: "2",
    name: "Royal Curry House",
    description:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    image: "/assets/restaurants/restaurant_2.png",
    rating: 4.2,
    deliveryTime: "25-35 min",
    category: "South Indian",
  },
  {
    id: "3",
    name: "Tandoor Express",
    description:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    image: "/assets/restaurants/restaurant_3.png",
    rating: 4.8,
    deliveryTime: "20-30 min",
    category: "Punjabi",
  },
];

export const RestaurantList = ({ onSelectRestaurant }: RestaurantListProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const {
    searchTerm,
    setSearchTerm,
    filteredItems: filteredRestaurants,
  } = useSearchFilter({
    items: mockRestaurants,
    searchFields: ["name", "category"],
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleRestaurantClick = (restaurant: Restaurant) => {
    console.log("Selected restaurant:", restaurant);
    onSelectRestaurant?.(restaurant);
    navigate("/meals");
  };

  if (loading) {
    return <Loading message="Loading restaurants..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
        <RestaurantIcon sx={{ mr: 2, fontSize: 32 }} />
        <DLSTypography variant="h4" component="h1">
          Browse Restaurants
        </DLSTypography>
      </Box>

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search restaurants or cuisine..."
      />

      {filteredRestaurants.length === 0 ? (
        <EmptyState message="No restaurants found matching your search." />
      ) : (
        <RestaurantsGrid>
          {filteredRestaurants.map((restaurant) => (
            <DLSCard
              key={restaurant.id}
              onClick={() => handleRestaurantClick(restaurant)}
              sx={{
                height: "100%",
                cursor: "pointer",
                transition: "transform 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={restaurant.image}
                alt={restaurant.name}
                sx={{ objectFit: "cover" }}
              />
              <Box sx={{ p: 2 }}>
                <DLSTypography variant="h6" component="h2" gutterBottom>
                  {restaurant.name}
                </DLSTypography>
                <DLSTypography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mb: 2 }}
                >
                  {restaurant.description}
                </DLSTypography>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <DLSTypography variant="body2" color="primary">
                    {restaurant.rating}
                  </DLSTypography>
                  <DLSTypography variant="body2" color="textSecondary">
                    {restaurant.deliveryTime}
                  </DLSTypography>
                </Box>
                <DLSTypography variant="caption" display="block" sx={{ mt: 1 }}>
                  {restaurant.category}
                </DLSTypography>
              </Box>
            </DLSCard>
          ))}
        </RestaurantsGrid>
      )}
    </Container>
  );
};
