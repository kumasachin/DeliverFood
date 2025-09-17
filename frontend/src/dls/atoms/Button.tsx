import React from "react";
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";

export interface DLSButtonProps extends Omit<MuiButtonProps, "variant"> {
  variant?: "primary" | "secondary" | "outlined" | "text" | "danger";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  loading?: boolean;
}

const StyledButton = styled(MuiButton, {
  shouldForwardProp: (prop) => prop !== "dlsVariant",
})<{ dlsVariant?: string }>(({ theme, dlsVariant }) => ({
  textTransform: "none",
  fontWeight: 500,
  borderRadius: theme.spacing(1),
  ...(dlsVariant === "primary" && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  }),
  ...(dlsVariant === "secondary" && {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    "&:hover": {
      backgroundColor: theme.palette.secondary.dark,
    },
  }),
  ...(dlsVariant === "danger" && {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    "&:hover": {
      backgroundColor: theme.palette.error.dark,
    },
  }),
}));

export const DLSButton: React.FC<DLSButtonProps> = ({
  variant = "primary",
  children,
  loading,
  disabled,
  ...props
}) => {
  const muiVariant =
    variant === "outlined"
      ? "outlined"
      : variant === "text"
      ? "text"
      : "contained";

  return (
    <StyledButton
      variant={muiVariant}
      dlsVariant={variant}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Loading..." : children}
    </StyledButton>
  );
};
