import React from "react";
import {
  Card as MuiCard,
  CardContent,
  CardActions,
  CardProps as MuiCardProps,
} from "@mui/material";
import { DLSTypography } from "../atoms/Typography";
import { DLSButton } from "../atoms/Button";

export interface DLSCardProps extends MuiCardProps {
  title?: string;
  subtitle?: string;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "outlined";
    disabled?: boolean;
  }>;
  children?: React.ReactNode;
}

export const DLSCard: React.FC<DLSCardProps> = ({
  title,
  subtitle,
  actions,
  children,
  ...props
}) => {
  return (
    <MuiCard {...props}>
      <CardContent>
        {title && (
          <DLSTypography variant="h6" gutterBottom>
            {title}
          </DLSTypography>
        )}
        {subtitle && (
          <DLSTypography variant="body2" color="textSecondary" gutterBottom>
            {subtitle}
          </DLSTypography>
        )}
        {children}
      </CardContent>
      {actions && actions.length > 0 && (
        <CardActions>
          {actions.map((action, index) => (
            <DLSButton
              key={index}
              variant={action.variant || "primary"}
              onClick={action.onClick}
              disabled={action.disabled}
              size="small"
            >
              {action.label}
            </DLSButton>
          ))}
        </CardActions>
      )}
    </MuiCard>
  );
};
