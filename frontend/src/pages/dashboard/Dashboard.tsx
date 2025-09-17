import React from "react";
import { Container, Alert } from "@mui/material";
import { DLSTypography } from "dls/atoms/Typography";
import { useAuth } from "contexts/AuthContext";

export const Dashboard = () => {
  const { state: authState } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <DLSTypography variant="h4" component="h1" gutterBottom>
        Dashboard
      </DLSTypography>

      {authState.isAuthenticated ? (
        <Alert severity="success">
          Welcome {authState.user?.email}! You are signed in as a{" "}
          {authState.user?.role}.
        </Alert>
      ) : (
        <Alert severity="warning">
          Please sign in to access the dashboard.
        </Alert>
      )}

      <DLSTypography variant="body1" sx={{ mt: 2 }}>
        Available features:
      </DLSTypography>
      <ul>
        <li>Browse restaurants and view their menus</li>
        <li>Add meals to cart and place orders</li>
        {authState.user?.role === "customer" && (
          <li>View your order history and track deliveries</li>
        )}
        {authState.user?.role === "owner" && (
          <>
            <li>Manage your restaurant orders and update status</li>
            <li>Search and manage customer accounts</li>
          </>
        )}
        {authState.user?.role === "admin" && (
          <li>Full system administration and order oversight</li>
        )}
      </ul>
    </Container>
  );
};
