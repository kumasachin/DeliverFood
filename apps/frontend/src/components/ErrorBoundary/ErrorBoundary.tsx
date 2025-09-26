import React, { ReactNode } from "react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { Box, Alert, AlertTitle, Button, Typography } from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";

interface ErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
}

const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh", p: 3 }}>
    <Alert
      severity="error"
      sx={{ maxWidth: 600, width: "100%" }}
      action={
        <Button color="inherit" size="small" onClick={resetErrorBoundary} startIcon={<RefreshIcon />}>
          Try Again
        </Button>
      }
    >
      <AlertTitle>Something went wrong</AlertTitle>
      <Typography variant="body2" sx={{ mb: 2 }}>
        An unexpected error occurred. Please try again.
      </Typography>
      {process.env.NODE_ENV === "development" && (
        <Typography variant="caption" component="pre" sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1, overflow: "auto", fontSize: "0.75rem" }}>
          {error.toString()}
        </Typography>
      )}
    </Alert>
  </Box>
);

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children, onReset }) => (
  <ReactErrorBoundary
    FallbackComponent={ErrorFallback}
    onReset={onReset}
    onError={(error) => console.error("Error caught:", error)}
  >
    {children}
  </ReactErrorBoundary>
);
