import React from "react";
import { useNavigate } from "react-router-dom";
import { Restaurant as RestaurantIcon } from "@mui/icons-material";
import styled from "styled-components";
import { Restaurant } from "types/restaurant";
import { Loading } from "../Common/Loading";
import { SearchBar } from "../Common/SearchBar";
import { EmptyState } from "../Common/EmptyState";
import { useSearchFilter, useRestaurants } from "hooks";
import { DLSCard } from "dls/molecules/Card";
import { DLSTypography } from "dls/atoms/Typography";
import { Box, CardMedia, Container } from "dls/atoms";
import { Restaurant as APIRestaurant } from "services/api";

type RestaurantListProps = {
  onSelectRestaurant?: (restaurant: Restaurant) => void;
};

const RestaurantsGrid = styled(Box)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 16px;
`;

const mapAPIRestaurantToComponent = (
  apiRestaurant: APIRestaurant
): Restaurant => ({
  id: apiRestaurant.uuid,
  uuid: apiRestaurant.uuid,
  name: apiRestaurant.title,
  description: apiRestaurant.description,
  cuisine: apiRestaurant.cuisine,
  category: apiRestaurant.cuisine,
  image: "/assets/restaurants/restaurant.png",
  rating: 4.5,
  deliveryTime: "30-45 min",
  ownerUuid: apiRestaurant.owner_uuid,
});

export const RestaurantList = ({ onSelectRestaurant }: RestaurantListProps) => {
  const navigate = useNavigate();
  const { restaurants: apiRestaurants, loading, error } = useRestaurants();

  const restaurants = apiRestaurants.map(mapAPIRestaurantToComponent);

  const {
    searchTerm,
    setSearchTerm,
    filteredItems: filteredRestaurants,
  } = useSearchFilter({
    items: restaurants,
    searchFields: ["name", "category"],
  });

  const handleRestaurantClick = (restaurant: Restaurant) => {
    console.log("Selected restaurant:", restaurant);
    onSelectRestaurant?.(restaurant);
    navigate("/meals");
  };

  if (loading) {
    return <Loading message="Loading restaurants..." />;
  }

  if (error) {
    return <EmptyState message={`Error loading restaurants: ${error}`} />;
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
