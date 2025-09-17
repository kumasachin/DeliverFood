import React from "react";
import {
  Typography as MuiTypography,
  TypographyProps as MuiTypographyProps,
} from "@mui/material";

export interface DLSTypographyProps extends MuiTypographyProps {
  variant?:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "body1"
    | "body2"
    | "caption"
    | "button"
    | "overline";
  color?:
    | "primary"
    | "secondary"
    | "error"
    | "warning"
    | "info"
    | "success"
    | "textPrimary"
    | "textSecondary";
  align?: "left" | "center" | "right" | "justify";
  gutterBottom?: boolean;
  noWrap?: boolean;
}

export const DLSTypography = ({
  variant = "body1",
  color = "textPrimary",
  children,
  ...props
}: DLSTypographyProps) => {
  return (
    <MuiTypography variant={variant} color={color} {...props}>
      {children}
    </MuiTypography>
  );
};
