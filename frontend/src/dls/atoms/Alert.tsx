import React from "react";
import { styled } from "@mui/material/styles";
import { Alert as MuiAlert, AlertProps as MuiAlertProps } from "@mui/material";

export interface AlertProps extends MuiAlertProps {
  children?: React.ReactNode;
}

const StyledAlert = styled(MuiAlert)(({ theme, severity }) => ({
  borderRadius: "12px",
  fontFamily: theme.typography.fontFamily,

  "&.MuiAlert-standardSuccess": {
    backgroundColor: "#f0f9f0",
    borderLeft: `4px solid ${theme.palette.success.main}`,
    color: theme.palette.success.dark,
  },

  "&.MuiAlert-standardError": {
    backgroundColor: "#fef2f2",
    borderLeft: `4px solid ${theme.palette.error.main}`,
    color: theme.palette.error.dark,
  },

  "&.MuiAlert-standardWarning": {
    backgroundColor: "#fefdf0",
    borderLeft: `4px solid ${theme.palette.warning.main}`,
    color: theme.palette.warning.dark,
  },

  "&.MuiAlert-standardInfo": {
    backgroundColor: "#f0f9ff",
    borderLeft: `4px solid ${theme.palette.info.main}`,
    color: theme.palette.info.dark,
  },
}));

export const Alert = ({ children, ...props }: AlertProps) => {
  return <StyledAlert {...props}>{children}</StyledAlert>;
};

export default Alert;
