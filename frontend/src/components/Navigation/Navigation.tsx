import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Restaurant,
  Login,
  PersonAdd,
  ShoppingCart,
  Logout,
  Receipt,
  Store,
  AdminPanelSettings,
  LocalOffer,
  RestaurantMenu,
  ManageAccounts,
} from "@mui/icons-material";
import { useAuth } from "contexts/AuthContext";
import { useCart } from "contexts/CartContext";
import { DLSTypography } from "dls/atoms/Typography";
import { DLSButton } from "dls/atoms/Button";
import { AppBar, Toolbar, Box, IconButton, Badge } from "dls/atoms";

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
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

  const getAuthenticatedNavItems = () => {
    const baseItems = [
      { path: "/restaurants", label: "Restaurants", icon: <Restaurant /> },
    ];

    if (authState.user?.role === "customer") {
      baseItems.push(
        {
          path: "/orders",
          label: "My Orders",
          icon: <Receipt />,
        },
        {
          path: "/coupons",
          label: "Browse Coupons",
          icon: <LocalOffer />,
        }
      );
    } else if (authState.user?.role === "owner") {
      baseItems.push(
        {
          path: "/restaurant-orders",
          label: "Restaurant Orders",
          icon: <Store />,
        },
        {
          path: "/restaurant-management",
          label: "Manage Restaurants",
          icon: <Restaurant />,
        },
        {
          path: "/meal-management",
          label: "Manage Meals",
          icon: <RestaurantMenu />,
        },
        {
          path: "/coupons",
          label: "Manage Coupons",
          icon: <LocalOffer />,
        }
      );
    } else if (authState.user?.role === "admin") {
      baseItems.push(
        {
          path: "/admin-orders",
          label: "Admin Dashboard",
          icon: <AdminPanelSettings />,
        },
        {
          path: "/customer-management",
          label: "Manage Customers",
          icon: <ManageAccounts />,
        }
      );
    }

    return baseItems;
  };

  const navItems = authState.isAuthenticated
    ? getAuthenticatedNavItems()
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
                navigate(item.path);
              }}
            >
              {item.label}
            </DLSButton>
          ))}

          {authState.isAuthenticated && (
            <>
              {authState.user?.role === "customer" && (
                <IconButton color="inherit" onClick={() => navigate("/cart")}>
                  <Badge badgeContent={totalItems} color="error">
                    <ShoppingCart />
                  </Badge>
                </IconButton>
              )}

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
