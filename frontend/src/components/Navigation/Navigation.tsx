import React from "react";
import { useLocation } from "react-router-dom";
import { AppBar, Toolbar, Box, IconButton, Badge } from "@mui/material";
import {
  Restaurant,
  Storefront,
  Login,
  PersonAdd,
  ShoppingCart,
  Logout,
  Receipt,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { DLSTypography } from "../../dls/atoms/Typography";
import { DLSButton } from "../../dls/atoms/Button";

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
    { path: "/orders", label: "Orders", icon: <Receipt /> },
  ];

  const navItems = authState.isAuthenticated
    ? authenticatedNavItems
    : guestNavItems;

  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar>
        <DLSTypography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Food Delivery App
        </DLSTypography>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {navItems.map((item) => (
            <DLSButton
              key={item.path}
              color="inherit"
              startIcon={item.icon}
              variant={location.pathname === item.path ? "outlined" : "text"}
              sx={{
                bgcolor:
                  location.pathname === item.path ? "#FFFFFF1A" : "transparent",
              }}
              onClick={() => {
                // Use navigate for programmatic navigation
                // For now keeping simple navigation
                window.location.href = item.path;
              }}
            >
              {item.label}
            </DLSButton>
          ))}

          {authState.isAuthenticated && (
            <>
              <IconButton
                color="inherit"
                onClick={() => (window.location.href = "/cart")}
              >
                <Badge badgeContent={totalItems} color="error">
                  <ShoppingCart />
                </Badge>
              </IconButton>

              <DLSButton
                color="inherit"
                startIcon={<Logout />}
                onClick={logout}
                sx={{ ml: 1 }}
              >
                Logout
              </DLSButton>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
