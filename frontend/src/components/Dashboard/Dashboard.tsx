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
        Navigation should now work properly:
      </DLSTypography>
      <ul>
        <li>Click "Restaurants" to browse restaurants</li>
        <li>Select a restaurant to view its meals</li>
        <li>Click "My Orders" (customers) to view your order history</li>
        <li>
          Click "Restaurant Orders" (owners) for restaurant order management
        </li>
        <li>Click "Admin Dashboard" (admins) for full order management</li>
      </ul>
    </Container>
  );
};
