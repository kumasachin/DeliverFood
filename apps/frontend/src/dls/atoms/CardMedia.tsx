import React from "react";
import { styled } from "@mui/material/styles";
import {
  CardMedia as MuiCardMedia,
  CardMediaProps as MuiCardMediaProps,
} from "@mui/material";

export interface CardMediaProps extends MuiCardMediaProps {
  component?: React.ElementType;
  height?: string | number;
  image?: string;
  alt?: string;
}

const StyledCardMedia = styled(MuiCardMedia)(({ theme }) => ({
  borderRadius: "12px 12px 0 0",

  transition: theme.transitions.create(["transform"], {
    duration: theme.transitions.duration.short,
  }),

  "&:hover": {
    transform: "scale(1.05)",
  },
}));

export const CardMedia = (props: CardMediaProps) => {
  return <StyledCardMedia {...props} />;
};

export default CardMedia;
