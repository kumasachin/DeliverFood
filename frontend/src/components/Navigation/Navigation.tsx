import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Badge,
} from "@mui/material";
import {
  Restaurant,
  Storefront,
  Login,
  PersonAdd,
  ShoppingCart,
  Logout,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";

export const Navigation = () => {
  const location = useLocation();
  const { state: authState, logout } = useAuth();
  const { state: cartState } = useCart();

  const totalItems = cartState.items.reduce(
    (sum: number, item: any) => sum + item.quantity,
    0
  );

  const guestNavItems = [
    { path: "/", label: "Sign In", icon: <Login /> },
    { path: "/signup", label: "Sign Up", icon: <PersonAdd /> },
  ];

  const authenticatedNavItems = [
    { path: "/restaurants", label: "Restaurants", icon: <Restaurant /> },
    { path: "/meals", label: "Meals", icon: <Storefront /> },
  ];

  const navItems = authState.isAuthenticated
    ? authenticatedNavItems
    : guestNavItems;

  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Food Delivery App
        </Typography>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              component={Link}
              to={item.path}
              color="inherit"
              startIcon={item.icon}
              variant={location.pathname === item.path ? "outlined" : "text"}
              sx={{
                bgcolor:
                  location.pathname === item.path ? "#FFFFFF1A" : "transparent",
              }}
            >
              {item.label}
            </Button>
          ))}

          {authState.isAuthenticated && (
            <>
              <IconButton color="inherit" component={Link} to="/cart">
                <Badge badgeContent={totalItems} color="error">
                  <ShoppingCart />
                </Badge>
              </IconButton>

              <Button
                color="inherit"
                startIcon={<Logout />}
                onClick={logout}
                sx={{ ml: 1 }}
              >
                Logout
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
