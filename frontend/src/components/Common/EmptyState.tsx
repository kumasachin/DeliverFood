import React from "react";
import { DLSTypography } from "dls/atoms/Typography";
import { Box } from "dls/atoms";

type EmptyStateProps = {
  message: string;
  icon?: React.ReactNode;
};

export const EmptyState = ({ message, icon }: EmptyStateProps) => (
  <Box textAlign="center" py={4}>
    {icon && <Box mb={2}>{icon}</Box>}
    <DLSTypography variant="h6" color="textSecondary">
      {message}
    </DLSTypography>
  </Box>
);
