import React from "react";
import {
  TextField as MuiTextField,
  TextFieldProps as MuiTextFieldProps,
} from "@mui/material";

export interface DLSInputProps extends Omit<MuiTextFieldProps, "variant"> {
  variant?: "outlined" | "filled" | "standard";
  size?: "small" | "medium";
  fullWidth?: boolean;
  error?: boolean;
  helperText?: string;
  required?: boolean;
}

export const DLSInput: React.FC<DLSInputProps> = ({
  variant = "outlined",
  size = "medium",
  fullWidth = false,
  ...props
}) => {
  return (
    <MuiTextField
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      {...props}
    />
  );
};
