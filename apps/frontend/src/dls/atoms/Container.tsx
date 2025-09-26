import React from "react";
import { styled } from "@mui/material/styles";
import {
  Container as MuiContainer,
  ContainerProps as MuiContainerProps,
} from "@mui/material";

export interface ContainerProps extends MuiContainerProps {
  children?: React.ReactNode;
}

const StyledContainer = styled(MuiContainer)(({ theme }) => ({}));

export const Container = ({ children, ...props }: ContainerProps) => {
  return <StyledContainer {...props}>{children}</StyledContainer>;
};

export default Container;
