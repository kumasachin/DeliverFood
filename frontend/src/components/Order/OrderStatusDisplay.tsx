import React from "react";
import {
  Box,
  Chip,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  PlayArrow,
  LocalShipping,
  CheckCircle,
  Cancel,
  Restaurant,
  Schedule,
} from "@mui/icons-material";
import { OrderStatus } from "../../types/order";
import { Role } from "../../types/auth";

interface OrderStatusDisplayProps {
  orderUuid: string;
  currentStatus: OrderStatus;
  userRole: Role;
  canUpdateStatus?: boolean;
  onStatusUpdate?: (newStatus: OrderStatus) => Promise<boolean>;
  isLoading?: boolean;
  error?: string | null;
  availableTransitions?: OrderStatus[];
}

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PLACED:
      return <Schedule />;
    case OrderStatus.PROCESSING:
      return <Restaurant />;
    case OrderStatus.IN_ROUTE:
      return <LocalShipping />;
    case OrderStatus.DELIVERED:
      return <CheckCircle />;
    case OrderStatus.RECEIVED:
      return <CheckCircle />;
    case OrderStatus.CANCELLED:
      return <Cancel />;
    default:
      return <Schedule />;
  }
};

const getStatusColor = (
  status: OrderStatus
):
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning" => {
  switch (status) {
    case OrderStatus.PLACED:
      return "info";
    case OrderStatus.PROCESSING:
      return "warning";
    case OrderStatus.IN_ROUTE:
      return "primary";
    case OrderStatus.DELIVERED:
      return "success";
    case OrderStatus.RECEIVED:
      return "success";
    case OrderStatus.CANCELLED:
      return "error";
    default:
      return "default";
  }
};

const getStatusLabel = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.PLACED:
      return "Order Placed";
    case OrderStatus.PROCESSING:
      return "Being Prepared";
    case OrderStatus.IN_ROUTE:
      return "On the Way";
    case OrderStatus.DELIVERED:
      return "Delivered";
    case OrderStatus.RECEIVED:
      return "Received";
    case OrderStatus.CANCELLED:
      return "Cancelled";
    default:
      return status;
  }
};

export const OrderStatusDisplay: React.FC<OrderStatusDisplayProps> = ({
  orderUuid,
  currentStatus,
  userRole,
  canUpdateStatus = false,
  onStatusUpdate,
  isLoading = false,
  error,
  availableTransitions = [],
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const getUpdateButtonText = (): string => {
    switch (userRole) {
      case "customer":
        return "Update Order";
      case "owner":
        return "Update Status";
      case "admin":
        return "Admin Update";
      default:
        return "Update Status";
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    handleMenuClose();
    if (onStatusUpdate) {
      await onStatusUpdate(newStatus);
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Chip
        icon={getStatusIcon(currentStatus)}
        label={getStatusLabel(currentStatus)}
        color={getStatusColor(currentStatus)}
        variant="filled"
        data-testid={`order-status-${currentStatus}`}
      />

      {error && (
        <Alert severity="error" sx={{ flex: 1 }}>
          {error}
        </Alert>
      )}

      {canUpdateStatus && availableTransitions.length > 0 && (
        <>
          <Button
            variant="outlined"
            size="small"
            onClick={handleMenuOpen}
            disabled={isLoading}
            startIcon={
              isLoading ? <CircularProgress size={16} /> : <PlayArrow />
            }
            data-testid="update-status-button"
          >
            {getUpdateButtonText()}
          </Button>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            data-testid="status-menu"
          >
            {availableTransitions.map((status) => (
              <MenuItem
                key={status}
                onClick={() => handleStatusChange(status)}
                data-testid={`status-option-${status}`}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {getStatusIcon(status)}
                  <Typography>{getStatusLabel(status)}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
    </Box>
  );
};
