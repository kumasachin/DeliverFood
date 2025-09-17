import React from "react";
import { styled } from "@mui/material/styles";
import {
  Divider as MuiDivider,
  DividerProps as MuiDividerProps,
} from "@mui/material";

export interface DividerProps extends MuiDividerProps {}

const StyledDivider = styled(MuiDivider)(({ theme }) => ({
  borderColor: theme.palette.divider,

  "&.MuiDivider-light": {
    borderColor: "rgba(255, 255, 255, 0.12)",
  },

  "&.MuiDivider-middle": {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
}));

export const Divider = (props: DividerProps) => {
  return <StyledDivider {...props} />;
};

export default Divider;
