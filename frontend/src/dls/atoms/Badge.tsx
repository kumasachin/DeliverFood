import React from "react";
import { styled } from "@mui/material/styles";
import { Badge as MuiBadge, BadgeProps as MuiBadgeProps } from "@mui/material";

export interface BadgeProps extends MuiBadgeProps {
  children?: React.ReactNode;
}

const StyledBadge = styled(MuiBadge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    fontWeight: 600,
    fontSize: "0.75rem",
    minWidth: "20px",
    height: "20px",
    borderRadius: "10px",

    "&.MuiBadge-colorPrimary": {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
    },

    "&.MuiBadge-colorSecondary": {
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.secondary.contrastText,
    },

    "&.MuiBadge-colorError": {
      backgroundColor: theme.palette.error.main,
      color: theme.palette.error.contrastText,
    },
  },
}));

export const Badge = ({ children, ...props }: BadgeProps) => {
  return <StyledBadge {...props}>{children}</StyledBadge>;
};

export default Badge;
