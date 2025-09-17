import React from "react";
import { Box, CircularProgress } from "@mui/material";
import { DLSTypography } from "../../dls/atoms/Typography";

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
    <DLSTypography variant="body1" color="textSecondary">
      {message}
    </DLSTypography>
  </Box>
);
