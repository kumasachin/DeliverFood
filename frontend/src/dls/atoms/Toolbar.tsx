import React from "react";
import { styled } from "@mui/material/styles";
import {
  Toolbar as MuiToolbar,
  ToolbarProps as MuiToolbarProps,
} from "@mui/material";

export interface ToolbarProps extends MuiToolbarProps {
  children?: React.ReactNode;
}

const StyledToolbar = styled(MuiToolbar)(({ theme }) => ({
  minHeight: "64px",
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),

  "&.MuiToolbar-regular": {
    minHeight: "64px",

    [theme.breakpoints.up("sm")]: {
      minHeight: "70px",
    },
  },
}));

export const Toolbar = ({ children, ...props }: ToolbarProps) => {
  return <StyledToolbar {...props}>{children}</StyledToolbar>;
};

export default Toolbar;
