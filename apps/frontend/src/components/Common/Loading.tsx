import React from "react";
import { DLSTypography } from "dls/atoms/Typography";
import { Box, CircularProgress } from "dls/atoms";

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
