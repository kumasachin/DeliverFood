import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";

type LoadingProps = {
  message?: string;
};

export const Loading = ({ message = "Loading..." }: LoadingProps) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    py={4}
  >
    <CircularProgress sx={{ mb: 2 }} />
    <Typography variant="body1" color="text.secondary">
      {message}
    </Typography>
  </Box>
);
