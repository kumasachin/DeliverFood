import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Search as SearchIcon,
  Block as BlockIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { apiService } from "../../services/api";

interface Customer {
  uuid: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

interface CustomerManagementProps {
  title?: string;
}

export const CustomerManagement: React.FC<CustomerManagementProps> = ({
  title = "Customer Management",
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    user: Customer | null;
    action: "block";
  }>({
    open: false,
    user: null,
    action: "block",
  });

  // For now, we'll simulate customer search since there's no specific endpoint
  // In a real scenario, you'd have a dedicated endpoint to search users
  const searchCustomers = async () => {
    if (!searchEmail.trim()) {
      setError("Please enter an email to search");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // This is a simulation - in reality you'd need a search endpoint
      // For now, we'll just show a message that this feature needs a search endpoint
      setError(
        "Customer search functionality requires a dedicated search endpoint to be implemented in the backend."
      );
      setCustomers([]);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to search customers");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (user: Customer) => {
    setConfirmDialog({
      open: true,
      user,
      action: "block",
    });
  };

  const confirmBlock = async () => {
    if (!confirmDialog.user) return;

    try {
      setActionLoading(confirmDialog.user.uuid);
      await apiService.blockUser(confirmDialog.user.uuid);

      // Update the user status in the list
      setCustomers((prev) =>
        prev.map((u) =>
          u.uuid === confirmDialog.user!.uuid ? { ...u, status: "blocked" } : u
        )
      );

      setConfirmDialog({ open: false, user: null, action: "block" });
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to block user");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "blocked":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={3}>
            <PersonIcon sx={{ mr: 2, color: "primary.main" }} />
            <Typography variant="h5" component="h1">
              {title}
            </Typography>
          </Box>

          {/* Search Section */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Search Customers
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <Box sx={{ flex: 1, minWidth: 300 }}>
                  <TextField
                    fullWidth
                    label="Customer Email"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    placeholder="Enter customer email to search..."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        searchCustomers();
                      }
                    }}
                  />
                </Box>
                <Box sx={{ minWidth: 120 }}>
                  <Button
                    variant="contained"
                    onClick={searchCustomers}
                    disabled={loading || !searchEmail.trim()}
                    startIcon={
                      loading ? <CircularProgress size={20} /> : <SearchIcon />
                    }
                  >
                    Search
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Info Card for Implementation Status */}
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Customer Search Implementation
            </Typography>
            <Typography variant="body2">
              To fully implement customer search and blocking, the backend needs
              a dedicated user search endpoint. Currently, restaurant owners can
              manage customers through the blocked users list, but direct
              customer search requires additional backend implementation.
            </Typography>
          </Alert>

          {customers.length > 0 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Join Date</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.uuid}>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={
                            customer.role.charAt(0).toUpperCase() +
                            customer.role.slice(1)
                          }
                          color="info"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            customer.status.charAt(0).toUpperCase() +
                            customer.status.slice(1)
                          }
                          color={getStatusColor(customer.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(customer.created_at)}</TableCell>
                      <TableCell align="center">
                        {customer.status === "active" ? (
                          <Tooltip title="Block Customer">
                            <IconButton
                              color="error"
                              onClick={() => handleBlockUser(customer)}
                              disabled={actionLoading === customer.uuid}
                              size="small"
                            >
                              {actionLoading === customer.uuid ? (
                                <CircularProgress size={20} />
                              ) : (
                                <BlockIcon />
                              )}
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Chip label="Blocked" color="error" size="small" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() =>
          setConfirmDialog({ open: false, user: null, action: "block" })
        }
      >
        <DialogTitle>Confirm Block</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to block user "{confirmDialog.user?.email}"?
            This will prevent them from placing orders at your restaurant.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setConfirmDialog({ open: false, user: null, action: "block" })
            }
          >
            Cancel
          </Button>
          <Button
            onClick={confirmBlock}
            color="error"
            variant="contained"
            disabled={!!actionLoading}
          >
            {actionLoading ? <CircularProgress size={20} /> : "Block Customer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerManagement;
