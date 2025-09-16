import React from "react";
import { Typography, Box } from "@mui/material";

type EmptyStateProps = {
  message: string;
  icon?: React.ReactNode;
};

export const EmptyState = ({ message, icon }: EmptyStateProps) => (
  <Box textAlign="center" py={4}>
    {icon && <Box mb={2}>{icon}</Box>}
    <Typography variant="h6" color="text.secondary">
      {message}
    </Typography>
  </Box>
);
