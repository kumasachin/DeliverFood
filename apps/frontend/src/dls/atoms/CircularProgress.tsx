import React from "react";
import { styled } from "@mui/material/styles";
import {
  CircularProgress as MuiCircularProgress,
  CircularProgressProps as MuiCircularProgressProps,
} from "@mui/material";

export interface CircularProgressProps extends MuiCircularProgressProps {}

const StyledCircularProgress = styled(MuiCircularProgress)(({ theme }) => ({
  color: theme.palette.primary.main,

  "&.MuiCircularProgress-colorPrimary": {
    color: theme.palette.primary.main,
  },

  "&.MuiCircularProgress-colorSecondary": {
    color: theme.palette.secondary.main,
  },
}));

export const CircularProgress = (props: CircularProgressProps) => {
  return <StyledCircularProgress {...props} />;
};

export default CircularProgress;
