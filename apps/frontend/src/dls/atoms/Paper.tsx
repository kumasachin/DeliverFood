import React from "react";
import { styled } from "@mui/material/styles";
import { Paper as MuiPaper, PaperProps as MuiPaperProps } from "@mui/material";

export interface PaperProps extends MuiPaperProps {
  children?: React.ReactNode;
}

const StyledPaper = styled(MuiPaper)(({ theme }) => ({
  borderRadius: "16px",
  padding: theme.spacing(3),
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  border: `1px solid ${theme.palette.divider}`,

  backgroundColor: theme.palette.background.paper,

  "&.MuiPaper-elevation1": {
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  },

  "&.MuiPaper-elevation2": {
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
  },

  "&.MuiPaper-elevation3": {
    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.15)",
  },
}));

export const Paper = ({ children, ...props }: PaperProps) => {
  return <StyledPaper {...props}>{children}</StyledPaper>;
};

export default Paper;
