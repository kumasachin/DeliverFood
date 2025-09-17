import React from "react";
import { styled } from "@mui/material/styles";
import { Box as MuiBox, BoxProps as MuiBoxProps } from "@mui/material";

export interface BoxProps extends MuiBoxProps {
  children?: React.ReactNode;
}

const StyledBox = styled(MuiBox)(({ theme }) => ({}));

export const Box = ({ children, ...props }: BoxProps) => {
  return <StyledBox {...props}>{children}</StyledBox>;
};

export default Box;
