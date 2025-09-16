import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline, Container } from "@mui/material";
import { SignIn } from "./components/Auth/SignIn";
import { SignUp } from "./components/Auth/SignUp";
import { RestaurantList } from "./components/Restaurant/RestaurantList";
import { MealList } from "./components/Meal/MealList";
import { Cart } from "./components/Cart/Cart";
import { Checkout } from "./components/Checkout/Checkout";
import { OrderList, SingleOrder } from "./components/Order";
import { Navigation } from "./components/Navigation/Navigation";
import { AuthProvider, CartProvider } from "./contexts";
import { Restaurant } from "./types/restaurant";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
  },
});

const AppContent = () => {
  const navigate = useNavigate();
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);

  const handleSelectRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const handleBackToRestaurants = () => {
    setSelectedRestaurant(null);
  };

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Routes>
          <Route
            path="/"
            element={<SignIn onSwitchToSignUp={() => navigate("/signup")} />}
          />
          <Route
            path="/signup"
            element={<SignUp onSwitchToSignIn={() => navigate("/")} />}
          />
          <Route
            path="/restaurants"
            element={
              <RestaurantList onSelectRestaurant={handleSelectRestaurant} />
            }
          />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<OrderList />} />
          <Route path="/orders/:orderId" element={<SingleOrder />} />
          <Route
            path="/meals"
            element={
              selectedRestaurant ? (
                <MealList
                  restaurant={selectedRestaurant}
                  onBackToRestaurants={handleBackToRestaurants}
                />
              ) : (
                <Navigate to="/restaurants" replace />
              )
            }
          />
        </Routes>
      </Container>
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <AppContent />
          </Router>
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
