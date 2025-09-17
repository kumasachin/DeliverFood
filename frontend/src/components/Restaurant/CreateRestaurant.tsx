import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "contexts/AuthContext";
import {
  Restaurant as RestaurantIcon,
  Save,
  Cancel,
} from "@mui/icons-material";
import styled from "styled-components";
import { DLSCard } from "dls/molecules/Card";
import { DLSTypography } from "dls/atoms/Typography";
import { DLSButton } from "dls/atoms/Button";
import { DLSInput } from "dls/atoms/Input";
import { Box, Container } from "dls/atoms";
import { apiService } from "services";
import { useAsyncOperation } from "hooks";

const StyledContainer = styled(Container)`
  padding: 32px 0;
`;

const FormBox = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const CoordinatesBox = styled(Box)`
  display: flex;
  gap: 16px;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

interface RestaurantFormData {
  title: string;
  description: string;
  cuisine: string;
  coordinates: {
    lat: string;
    lng: string;
  };
}

export const CreateRestaurant = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const [formData, setFormData] = useState<RestaurantFormData>({
    title: "",
    description: "",
    cuisine: "",
    coordinates: {
      lat: "37.7749",
      lng: "-122.4194",
    },
  });

  const {
    execute: createRestaurant,
    loading,
    error,
  } = useAsyncOperation(async () => {
    if (!state.user || state.user.role !== "owner") {
      throw new Error("Only restaurant owners can create restaurants");
    }

    await apiService.createRestaurant(formData);
    navigate("/restaurants");
  });

  const handleInputChange =
    (field: keyof RestaurantFormData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (field === "coordinates") return;

      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleCoordinateChange =
    (coord: "lat" | "lng") => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        coordinates: {
          ...prev.coordinates,
          [coord]: event.target.value,
        },
      }));
    };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    createRestaurant();
  };

  const handleCancel = () => {
    navigate("/restaurants");
  };

  if (state.user?.role !== "owner") {
    return (
      <StyledContainer maxWidth="md">
        <DLSCard sx={{ p: 4, textAlign: "center" }}>
          <DLSTypography variant="h5" color="error" gutterBottom>
            Access Denied
          </DLSTypography>
          <DLSTypography variant="body1">
            Only restaurant owners can create restaurants.
          </DLSTypography>
        </DLSCard>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer maxWidth="md">
      <Box display="flex" alignItems="center" sx={{ mb: 4 }}>
        <RestaurantIcon sx={{ mr: 2, fontSize: 32 }} />
        <DLSTypography variant="h4" component="h1">
          Create New Restaurant
        </DLSTypography>
      </Box>

      <DLSCard sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <FormBox>
            <DLSInput
              fullWidth
              label="Restaurant Name"
              value={formData.title}
              onChange={handleInputChange("title")}
              required
              disabled={loading}
            />

            <DLSInput
              fullWidth
              label="Description"
              value={formData.description}
              onChange={handleInputChange("description")}
              multiline
              rows={4}
              required
              disabled={loading}
            />

            <DLSInput
              fullWidth
              label="Cuisine Type"
              value={formData.cuisine}
              onChange={handleInputChange("cuisine")}
              placeholder="e.g., Italian, Chinese, Indian"
              required
              disabled={loading}
            />

            <CoordinatesBox>
              <DLSInput
                fullWidth
                label="Latitude"
                value={formData.coordinates.lat}
                onChange={handleCoordinateChange("lat")}
                type="number"
                inputProps={{ step: "any" }}
                required
                disabled={loading}
              />

              <DLSInput
                fullWidth
                label="Longitude"
                value={formData.coordinates.lng}
                onChange={handleCoordinateChange("lng")}
                type="number"
                inputProps={{ step: "any" }}
                required
                disabled={loading}
              />
            </CoordinatesBox>

            {error && (
              <DLSTypography variant="body2" color="error">
                {error}
              </DLSTypography>
            )}

            <Box display="flex" gap={2} justifyContent="flex-end">
              <DLSButton
                variant="outlined"
                onClick={handleCancel}
                disabled={loading}
                startIcon={<Cancel />}
              >
                Cancel
              </DLSButton>
              <DLSButton
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={<Save />}
              >
                {loading ? "Creating..." : "Create Restaurant"}
              </DLSButton>
            </Box>
          </FormBox>
        </form>
      </DLSCard>
    </StyledContainer>
  );
};
