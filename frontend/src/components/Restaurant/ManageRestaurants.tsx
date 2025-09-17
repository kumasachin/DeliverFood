import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "contexts/AuthContext";
import { 
  Restaurant as RestaurantIcon, 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon 
} from "@mui/icons-material";
import styled from "styled-components";
import { DLSCard } from "dls/molecules/Card";
import { DLSTypography } from "dls/atoms/Typography";
import { DLSButton } from "dls/atoms/Button";
import { Box, Container } from "dls/atoms";
import { useRestaurants } from "hooks";
import { Loading } from "../Common/Loading";
import { EmptyState } from "../Common/EmptyState";

const StyledContainer = styled(Container)`
  padding: 32px 0;
`;

const RestaurantsGrid = styled(Box)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 16px;
`;

const RestaurantActions = styled(Box)`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`;

export const ManageRestaurants = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  
  const { 
    restaurants, 
    loading, 
    error 
  } = useRestaurants({ 
    owner_uuid: state.user?.id 
  });

  const handleCreateRestaurant = () => {
    navigate("/create-restaurant");
  };

  const handleEditRestaurant = (restaurantId: string) => {
    console.log("Edit restaurant:", restaurantId);
  };

  const handleDeleteRestaurant = (restaurantId: string) => {
    console.log("Delete restaurant:", restaurantId);
  };

  if (state.user?.role !== "owner") {
    return (
      <StyledContainer maxWidth="lg">
        <DLSCard sx={{ p: 4, textAlign: "center" }}>
          <DLSTypography variant="h5" color="error" gutterBottom>
            Access Denied
          </DLSTypography>
          <DLSTypography variant="body1">
            Only restaurant owners can manage restaurants.
          </DLSTypography>
        </DLSCard>
      </StyledContainer>
    );
  }

  if (loading) {
    return <Loading message="Loading your restaurants..." />;
  }

  if (error) {
    return <EmptyState message={`Error loading restaurants: ${error}`} />;
  }

  return (
    <StyledContainer maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box display="flex" alignItems="center">
          <RestaurantIcon sx={{ mr: 2, fontSize: 32 }} />
          <DLSTypography variant="h4" component="h1">
            Manage Restaurants
          </DLSTypography>
        </Box>
        <DLSButton
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateRestaurant}
        >
          Add Restaurant
        </DLSButton>
      </Box>

      {restaurants.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <EmptyState message="You haven't created any restaurants yet. Start by adding your first restaurant!" />
          <DLSButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateRestaurant}
            sx={{ mt: 2 }}
          >
            Create Restaurant
          </DLSButton>
        </Box>
      ) : (
        <RestaurantsGrid>
          {restaurants.map((restaurant) => (
            <DLSCard key={restaurant.uuid} sx={{ height: "100%" }}>
              <Box sx={{ p: 3 }}>
                <DLSTypography variant="h6" component="h2" gutterBottom>
                  {restaurant.title}
                </DLSTypography>
                <DLSTypography 
                  variant="body2" 
                  color="textSecondary" 
                  sx={{ mb: 2 }}
                >
                  {restaurant.description}
                </DLSTypography>
                <DLSTypography variant="body2" color="primary" sx={{ mb: 2 }}>
                  Cuisine: {restaurant.cuisine}
                </DLSTypography>
                <DLSTypography variant="caption" display="block" sx={{ mb: 2 }}>
                  Created: {new Date(restaurant.created_at).toLocaleDateString()}
                </DLSTypography>
                
                <RestaurantActions>
                  <DLSButton
                    variant="outlined"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditRestaurant(restaurant.uuid)}
                  >
                    Edit
                  </DLSButton>
                  <DLSButton
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteRestaurant(restaurant.uuid)}
                  >
                    Delete
                  </DLSButton>
                </RestaurantActions>
              </Box>
            </DLSCard>
          ))}
        </RestaurantsGrid>
      )}
    </StyledContainer>
  );
};