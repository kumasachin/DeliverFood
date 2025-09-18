import React, { useState, Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Container, CircularProgress, Box } from "@mui/material";
import { Navigation } from "../components/Navigation/Navigation";
import { Restaurant } from "../types/restaurant";
import { useAuth } from "../contexts/AuthContext";

// Lazy load pages
const SignIn = lazy(() => import("../pages/auth/SignIn").then((m) => ({ default: m.SignIn })));
const SignUp = lazy(() => import("../pages/auth/SignUp").then((m) => ({ default: m.SignUp })));
const Dashboard = lazy(() => import("../pages/dashboard/Dashboard").then((m) => ({ default: m.Dashboard })));
const Cart = lazy(() => import("../pages/cart/Cart").then((m) => ({ default: m.Cart })));
const Checkout = lazy(() => import("../pages/checkout/Checkout").then((m) => ({ default: m.Checkout })));
const RestaurantList = lazy(() => import("../pages/restaurants/RestaurantList").then((m) => ({ default: m.RestaurantList })));
const MealList = lazy(() => import("../pages/meals/MealList").then((m) => ({ default: m.MealList })));
const SingleOrder = lazy(() => import("../pages/orders/SingleOrder").then((m) => ({ default: m.SingleOrder })));
const OrdersDashboard = lazy(() => import("../pages/orders/OrdersDashboard").then((m) => ({ default: m.OrdersDashboard })));
const RestaurantOrdersDashboard = lazy(() => import("../pages/orders/RestaurantOrdersDashboard").then((m) => ({ default: m.RestaurantOrdersDashboard })));
const AdminOrdersDashboard = lazy(() => import("../pages/orders/AdminOrdersDashboard").then((m) => ({ default: m.AdminOrdersDashboard })));
const MealManagement = lazy(() => import("../pages/meals/Management/MealManagement").then((m) => ({ default: m.MealManagement })));
const RestaurantManagement = lazy(() => import("../pages/restaurants/Management/RestaurantManagement").then((m) => ({ default: m.RestaurantManagement })));
const CustomerManagement = lazy(() => import("../pages/users/CustomerManagement").then((m) => ({ default: m.CustomerManagement })));

const LoadingScreen = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
    <CircularProgress />
  </Box>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { state } = useAuth();
  
  if (state.isLoading) return <LoadingScreen />;
  return state.isAuthenticated ? <>{children}</> : <Navigate to="/signin" replace />;
};

export const AppRouter = () => {
  const { state } = useAuth();
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const homeRedirect = state.isAuthenticated ? <Navigate to="/restaurants" replace /> : <Navigate to="/signin" replace />;

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Authentication Routes */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/restaurants" element={<ProtectedRoute><RestaurantList onSelectRestaurant={setSelectedRestaurant} /></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrdersDashboard /></ProtectedRoute>} />
            <Route path="/restaurant-orders" element={<ProtectedRoute><RestaurantOrdersDashboard /></ProtectedRoute>} />
            <Route path="/admin-orders" element={<ProtectedRoute><AdminOrdersDashboard /></ProtectedRoute>} />
            <Route path="/meal-management" element={<ProtectedRoute><MealManagement /></ProtectedRoute>} />
            <Route path="/restaurant-management" element={<ProtectedRoute><RestaurantManagement /></ProtectedRoute>} />
            <Route path="/customer-management" element={<ProtectedRoute><CustomerManagement /></ProtectedRoute>} />
            <Route path="/orders/:orderId" element={<ProtectedRoute><SingleOrder /></ProtectedRoute>} />
            
            {/* Meal List Route */}
            <Route
              path="/meals"
              element={
                <ProtectedRoute>
                  {selectedRestaurant ? (
                    <MealList restaurant={selectedRestaurant} onBackToRestaurants={() => setSelectedRestaurant(null)} />
                  ) : (
                    <Navigate to="/restaurants" replace />
                  )}
                </ProtectedRoute>
              }
            />

            {/* Default Routes */}
            <Route path="/" element={homeRedirect} />
            <Route path="*" element={<Navigate to="/signin" replace />} />
          </Routes>
        </Suspense>
      </Container>
    </>
  );
};
