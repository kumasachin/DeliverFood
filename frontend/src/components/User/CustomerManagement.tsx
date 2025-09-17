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
  const [userEmail, setUserEmail] = useState("");
  const [foundUser, setFoundUser] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    user: Customer | null;
    action: "block";
  }>({
    open: false,
    user: null,
    action: "block",
  });

  const searchUser = async () => {
    if (!userEmail.trim()) {
      setError("Please enter an email address");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setFoundUser(null);

    try {
      const user = await apiService.searchUserByEmail(userEmail.trim());
      setFoundUser(user);
      setSuccess(`Found user: ${user.email}`);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError("User not found with this email address");
      } else {
        setError(err.response?.data?.error || "Failed to search user");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (user: Customer) => {
    if (user.status === "blocked") {
      setError("User is already blocked");
      return;
    }

    setConfirmDialog({
      open: true,
      user,
      action: "block",
    });
  };

  const confirmBlock = async () => {
    if (!confirmDialog.user) return;

    try {
      setLoading(true);
      setError(null);

      await apiService.blockUser(confirmDialog.user.uuid);

      // Update the found user status
      setFoundUser((prev) => (prev ? { ...prev, status: "blocked" } : null));
      setSuccess(
        `User ${confirmDialog.user.email} has been blocked successfully`
      );

      setConfirmDialog({ open: false, user: null, action: "block" });
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to block user");
    } finally {
      setLoading(false);
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
                Search and Block Users
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
                    label="User Email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="Enter user email to search..."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        searchUser();
                      }
                    }}
                  />
                </Box>
                <Box sx={{ minWidth: 120 }}>
                  <Button
                    variant="contained"
                    onClick={searchUser}
                    disabled={loading || !userEmail.trim()}
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

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          {/* Show found user */}
          {foundUser && (
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  User Found
                </Typography>
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
                      <TableRow>
                        <TableCell>{foundUser.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={
                              foundUser.role.charAt(0).toUpperCase() +
                              foundUser.role.slice(1)
                            }
                            color="info"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              foundUser.status.charAt(0).toUpperCase() +
                              foundUser.status.slice(1)
                            }
                            color={getStatusColor(foundUser.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {formatDate(foundUser.created_at)}
                        </TableCell>
                        <TableCell align="center">
                          {foundUser.status === "active" && (
                            <Tooltip title="Block User">
                              <IconButton
                                color="error"
                                onClick={() => handleBlockUser(foundUser)}
                                disabled={loading}
                              >
                                <BlockIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          {foundUser.status === "blocked" && (
                            <Chip
                              label="Already Blocked"
                              color="error"
                              size="small"
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
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
        <DialogTitle>Confirm Block User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to block user "{confirmDialog.user?.email}"?
            This will prevent them from logging into the system.
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
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : "Block User"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
