import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline, Container } from "@mui/material";
import { SignIn } from "./components/Auth/SignIn";
import { SignUp } from "./components/Auth/SignUp";
import { RestaurantList } from "./components/Restaurant/RestaurantList";
import { MealList } from "./components/Meal/MealList";
import { Navigation } from "./components/Navigation/Navigation";
import { Restaurant } from "./types/restaurant";
import { Meal } from "./types/meal";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
  },
});

const App = () => {
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);

  const handleSignIn = (email: string, role: string) => {
    console.log("User signed in:", email, role);
  };

  const handleSignUp = (email: string, role: string) => {
    console.log("User signed up:", email, role);
  };

  const handleSelectRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const handleAddToCart = (meal: Meal) => {
    console.log("Added to cart:", meal);
  };

  const handleBackToRestaurants = () => {
    setSelectedRestaurant(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navigation />
        <Container maxWidth="lg" sx={{ py: 2 }}>
          <Routes>
            <Route
              path="/"
              element={
                <SignIn onSignIn={handleSignIn} onSwitchToSignUp={() => {}} />
              }
            />
            <Route
              path="/signup"
              element={
                <SignUp onSignUp={handleSignUp} onSwitchToSignIn={() => {}} />
              }
            />
            <Route
              path="/restaurants"
              element={
                <RestaurantList onSelectRestaurant={handleSelectRestaurant} />
              }
            />
            <Route
              path="/meals"
              element={
                selectedRestaurant ? (
                  <MealList
                    restaurant={selectedRestaurant}
                    onAddToCart={handleAddToCart}
                    onBackToRestaurants={handleBackToRestaurants}
                  />
                ) : (
                  <Navigate to="/restaurants" replace />
                )
              }
            />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
};

export default App;
