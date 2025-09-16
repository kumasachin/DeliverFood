import React from "react";
import { Link, useLocation } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Restaurant, Storefront, Login, PersonAdd } from "@mui/icons-material";

export const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Sign In", icon: <Login /> },
    { path: "/signup", label: "Sign Up", icon: <PersonAdd /> },
    { path: "/restaurants", label: "Restaurants", icon: <Restaurant /> },
    { path: "/meals", label: "Meals", icon: <Storefront /> },
  ];

  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Food Delivery App
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
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
                  location.pathname === item.path
                    ? "rgba(255,255,255,0.1)"
                    : "transparent",
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
