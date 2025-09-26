import React from "react";
import { styled } from "@mui/material/styles";
import {
  AppBar as MuiAppBar,
  AppBarProps as MuiAppBarProps,
} from "@mui/material";

export interface AppBarProps extends MuiAppBarProps {
  children?: React.ReactNode;
}

const StyledAppBar = styled(MuiAppBar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  borderBottom: `1px solid ${theme.palette.divider}`,

  "&.MuiAppBar-colorPrimary": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
}));

export const AppBar = ({ children, ...props }: AppBarProps) => {
  return <StyledAppBar {...props}>{children}</StyledAppBar>;
};

export default AppBar;
