import React from "react";
import { styled } from "@mui/material/styles";
import { Chip as MuiChip, ChipProps as MuiChipProps } from "@mui/material";

export interface ChipProps extends MuiChipProps {}

const StyledChip = styled(MuiChip)(({ theme, variant, color }) => ({
  borderRadius: "20px",
  fontWeight: 500,
  fontSize: "0.75rem",
  height: "28px",

  "&.MuiChip-filled": {
    "&.MuiChip-colorPrimary": {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
    },

    "&.MuiChip-colorSecondary": {
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.secondary.contrastText,
    },

    "&.MuiChip-colorDefault": {
      backgroundColor: theme.palette.grey[200],
      color: theme.palette.text.primary,
    },
  },

  "&.MuiChip-outlined": {
    borderWidth: "1px",

    "&.MuiChip-colorPrimary": {
      borderColor: theme.palette.primary.main,
      color: theme.palette.primary.main,
    },

    "&.MuiChip-colorSecondary": {
      borderColor: theme.palette.secondary.main,
      color: theme.palette.secondary.main,
    },
  },

  "&:hover": {
    transform: "scale(1.05)",
  },

  transition: theme.transitions.create(["transform"], {
    duration: theme.transitions.duration.short,
  }),
}));

export const Chip = (props: ChipProps) => {
  return <StyledChip {...props} />;
};

export default Chip;
