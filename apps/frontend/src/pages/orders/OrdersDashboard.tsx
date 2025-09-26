import React from "react";
import { useAuth } from "contexts/AuthContext";
import { CustomerOrdersDashboard } from "./CustomerOrdersDashboard";
import { RestaurantOrdersDashboard } from "./RestaurantOrdersDashboard";
import { AdminOrdersDashboard } from "./AdminOrdersDashboard";
import { Alert, Container } from "@mui/material";

export const OrdersDashboard = () => {
  const { state: authState } = useAuth();

  if (!authState.isAuthenticated || !authState.user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">Please sign in to view orders.</Alert>
      </Container>
    );
  }

  switch (authState.user.role) {
    case "customer":
      return <CustomerOrdersDashboard />;
    case "owner":
      return <RestaurantOrdersDashboard />;
    case "admin":
      return <AdminOrdersDashboard />;
    default:
      return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error">Invalid user role.</Alert>
        </Container>
      );
  }
};
