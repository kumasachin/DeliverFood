import React from "react";
import { Box } from "@mui/material";
import { DLSInput, DLSInputProps } from "../atoms/Input";
import { DLSTypography } from "../atoms/Typography";

export interface DLSFormFieldProps extends DLSInputProps {
  label?: string;
  description?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

export const DLSFormField: React.FC<DLSFormFieldProps> = ({
  label,
  description,
  required,
  error,
  helperText,
  ...inputProps
}) => {
  return (
    <Box sx={{ mb: 2 }}>
      {label && (
        <DLSTypography variant="body2" gutterBottom>
          {label} {required && <span style={{ color: "red" }}>*</span>}
        </DLSTypography>
      )}
      {description && (
        <DLSTypography variant="caption" color="textSecondary" gutterBottom>
          {description}
        </DLSTypography>
      )}
      <DLSInput
        required={required}
        error={error}
        helperText={helperText}
        fullWidth
        {...inputProps}
      />
    </Box>
  );
};
