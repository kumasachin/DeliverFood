import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Assignment,
  Restaurant,
  LocalShipping,
  Inventory,
  CheckCircle,
  Cancel,
  Schedule,
} from "@mui/icons-material";
import { OrderStatus } from "../../types/order";

interface OrderHistoryProps {
  history: Array<{ status: string; changed_at: string }>;
  currentStatus: OrderStatus;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "placed":
      return <Assignment fontSize="small" />;
    case "processing":
      return <Restaurant fontSize="small" />;
    case "in route":
      return <LocalShipping fontSize="small" />;
    case "delivered":
      return <Inventory fontSize="small" />;
    case "received":
      return <CheckCircle fontSize="small" />;
    case "cancelled":
      return <Cancel fontSize="small" />;
    default:
      return <Schedule fontSize="small" />;
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case "placed":
      return "Order Placed";
    case "processing":
      return "Being Prepared";
    case "in route":
      return "On the Way";
    case "delivered":
      return "Delivered";
    case "received":
      return "Received";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
};

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

export const OrderHistory: React.FC<OrderHistoryProps> = ({
  history,
  currentStatus,
}) => {
  if (history.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="textSecondary">
          No status history available
        </Typography>
      </Box>
    );
  }

  return (
    <Box data-testid="order-history">
      <Typography variant="h6" sx={{ mb: 2 }}>
        Order Status History
      </Typography>
      <List>
        {history.map((item, index) => (
          <React.Fragment key={index}>
            <ListItem sx={{ py: 1 }}>
              <ListItemIcon sx={{ fontSize: "1.5rem", minWidth: 40 }}>
                {getStatusIcon(item.status)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    variant="body1"
                    component="div"
                    data-testid={`history-status-${item.status}`}
                    sx={{
                      fontWeight: item.status === currentStatus ? 600 : 400,
                      color:
                        item.status === currentStatus
                          ? "primary.main"
                          : "text.primary",
                    }}
                  >
                    {getStatusLabel(item.status)}
                  </Typography>
                }
                secondary={
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    data-testid={`history-timestamp-${index}`}
                  >
                    {formatTimestamp(item.changed_at)}
                  </Typography>
                }
              />
            </ListItem>
            {index < history.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};
