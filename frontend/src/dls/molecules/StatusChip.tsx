import React from "react";
import { Chip } from "@mui/material";

export interface DLSStatusChipProps {
  status: string;
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning";
  size?: "small" | "medium";
  label?: string;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "placed":
      return "primary";
    case "processing":
      return "warning";
    case "in route":
      return "info";
    case "delivered":
      return "success";
    case "received":
    case "completed":
      return "default";
    case "cancelled":
    case "failed":
      return "error";
    default:
      return "default";
  }
};

export const DLSStatusChip: React.FC<DLSStatusChipProps> = ({
  status,
  variant,
  size = "small",
  label,
}) => {
  const color = variant || getStatusColor(status);
  const displayText = label || status.toUpperCase();

  return <Chip label={displayText} color={color as any} size={size} />;
};
