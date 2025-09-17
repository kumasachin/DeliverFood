import React from "react";
import { styled } from "@mui/material/styles";
import {
  IconButton as MuiIconButton,
  IconButtonProps as MuiIconButtonProps,
} from "@mui/material";

export interface IconButtonProps extends MuiIconButtonProps {
  children?: React.ReactNode;
}

const StyledIconButton = styled(MuiIconButton)(({ theme }) => ({
  borderRadius: "12px",
  padding: theme.spacing(1),
  color: theme.palette.text.primary,

  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    transform: "scale(1.05)",
  },

  "&.MuiIconButton-colorPrimary": {
    color: theme.palette.primary.main,
    "&:hover": {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.contrastText,
    },
  },

  "&.MuiIconButton-colorSecondary": {
    color: theme.palette.secondary.main,
    "&:hover": {
      backgroundColor: theme.palette.secondary.light,
      color: theme.palette.secondary.contrastText,
    },
  },

  transition: theme.transitions.create(["transform", "background-color"], {
    duration: theme.transitions.duration.short,
  }),
}));

export const IconButton = ({ children, ...props }: IconButtonProps) => {
  return <StyledIconButton {...props}>{children}</StyledIconButton>;
};

export default IconButton;
