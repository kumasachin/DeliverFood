import React, { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Container } from "@mui/material";

import { SignIn } from "../components/Auth/SignIn";
import { SignUp } from "../components/Auth/SignUp";
import { RestaurantList } from "../components/Restaurant/RestaurantList";
import { MealList } from "../components/Meal/MealList";
import { Cart } from "../components/Cart/Cart";
import { Checkout } from "../components/Checkout/Checkout";
import { Dashboard } from "../components/Dashboard";
import {
  OrderList,
  SingleOrder,
  RestaurantOrdersDashboard,
  AdminOrdersDashboard,
} from "../components/Order";
import { Navigation } from "../components/Navigation/Navigation";
import { Restaurant } from "../types/restaurant";
import { useAuth } from "../contexts/AuthContext";

const LoadingScreen = () => <div>Loading...</div>;

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { state } = useAuth();

  if (state.isLoading) return <LoadingScreen />;

  return state.isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/signin" replace />
  );
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { state } = useAuth();

  if (state.isLoading) return <LoadingScreen />;

  return state.isAuthenticated ? (
    <Navigate to="/restaurants" replace />
  ) : (
    <>{children}</>
  );
};

export const AppRouter = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);

  const selectRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const backToRestaurants = () => {
    setSelectedRestaurant(null);
  };

  const goToSignUp = () => navigate("/signup");
  const goToSignIn = () => navigate("/signin");

  const redirectToHome = state.isAuthenticated ? (
    <Navigate to="/restaurants" replace />
  ) : (
    <Navigate to="/signin" replace />
  );

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Routes>
          <Route
            path="/signin"
            element={<SignIn onSwitchToSignUp={goToSignUp} />}
          />

          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignUp onSwitchToSignIn={goToSignIn} />
              </PublicRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/restaurants"
            element={
              <ProtectedRoute>
                <RestaurantList onSelectRestaurant={selectRestaurant} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrderList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/restaurant-orders"
            element={
              <ProtectedRoute>
                <RestaurantOrdersDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-orders"
            element={
              <ProtectedRoute>
                <AdminOrdersDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders/:orderId"
            element={
              <ProtectedRoute>
                <SingleOrder />
              </ProtectedRoute>
            }
          />

          <Route
            path="/meals"
            element={
              <ProtectedRoute>
                {selectedRestaurant ? (
                  <MealList
                    restaurant={selectedRestaurant}
                    onBackToRestaurants={backToRestaurants}
                  />
                ) : (
                  <Navigate to="/restaurants" replace />
                )}
              </ProtectedRoute>
            }
          />

          <Route path="/" element={redirectToHome} />
          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      </Container>
    </>
  );
};
