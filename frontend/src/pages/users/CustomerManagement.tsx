import React, { useState, useEffect } from "react";
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
  CheckCircle as CheckCircleIcon,
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
  title = "User Management",
}) => {
  const [allUsers, setAllUsers] = useState<Customer[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Customer[]>([]);
  const [filterText, setFilterText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    user: Customer | null;
    action: "block" | "unblock";
  }>({
    open: false,
    user: null,
    action: "block",
  });

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const users = await apiService.getAllUsers();
      setAllUsers(users);
      setFilteredUsers(users);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = (text: string) => {
    setFilterText(text);
    if (!text.trim()) {
      setFilteredUsers(allUsers);
    } else {
      const filtered = allUsers.filter(
        (user) =>
          user.email.toLowerCase().includes(text.toLowerCase()) ||
          user.role.toLowerCase().includes(text.toLowerCase()) ||
          user.status.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  const updateUserStatus = (userId: string, newStatus: string) => {
    setAllUsers((prev) =>
      prev.map((user) =>
        user.uuid === userId ? { ...user, status: newStatus } : user
      )
    );
    setFilteredUsers((prev) =>
      prev.map((user) =>
        user.uuid === userId ? { ...user, status: newStatus } : user
      )
    );
  };

  const handleBlockUser = (user: Customer) => {
    setConfirmDialog({
      open: true,
      user,
      action: "block",
    });
  };

  const handleUnblockUser = (user: Customer) => {
    setConfirmDialog({
      open: true,
      user,
      action: "unblock",
    });
  };

  const confirmAction = async () => {
    if (!confirmDialog.user) return;

    try {
      setActionLoading(confirmDialog.user.uuid);

      if (confirmDialog.action === "block") {
        await apiService.blockUser(confirmDialog.user.uuid);
        updateUserStatus(confirmDialog.user.uuid, "blocked");
        setSuccess(
          "User " + confirmDialog.user.email + " has been blocked successfully"
        );
      } else {
        await apiService.unblockUser(confirmDialog.user.uuid);
        updateUserStatus(confirmDialog.user.uuid, "active");
        setSuccess(
          "User " +
            confirmDialog.user.email +
            " has been unblocked successfully"
        );
      }

      setError(null);
      setConfirmDialog({ open: false, user: null, action: "block" });
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          "Failed to " + confirmDialog.action + " user"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ open: false, user: null, action: "block" });
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

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

          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PersonIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6">All Users</Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Filter Users"
                  value={filterText}
                  onChange={(e) => filterUsers(e.target.value)}
                  placeholder="Search by email, role, or status..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {loading ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              ) : filteredUsers.length === 0 ? (
                <Alert severity="info">
                  <Typography variant="h6" gutterBottom>
                    {filterText
                      ? "No users match your filter"
                      : "No users found"}
                  </Typography>
                  <Typography>
                    {filterText
                      ? "Try adjusting your search criteria."
                      : "There are no users in the system."}
                  </Typography>
                </Alert>
              ) : (
                <>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Showing {filteredUsers.length} of {allUsers.length} users
                  </Typography>
                  <TableContainer component={Paper} elevation={0}>
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
                        {filteredUsers.map((user) => (
                          <TableRow key={user.uuid}>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Chip
                                label={
                                  user.role.charAt(0).toUpperCase() +
                                  user.role.slice(1)
                                }
                                color="info"
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={
                                  user.status.charAt(0).toUpperCase() +
                                  user.status.slice(1)
                                }
                                color={
                                  user.status === "blocked"
                                    ? "error"
                                    : "success"
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {new Date(user.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell align="center">
                              {user.status === "blocked" ? (
                                <Tooltip title="Unblock User">
                                  <IconButton
                                    color="success"
                                    onClick={() => handleUnblockUser(user)}
                                    disabled={actionLoading === user.uuid}
                                    size="small"
                                  >
                                    {actionLoading === user.uuid ? (
                                      <CircularProgress size={20} />
                                    ) : (
                                      <CheckCircleIcon />
                                    )}
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                <Tooltip title="Block User">
                                  <IconButton
                                    color="error"
                                    onClick={() => handleBlockUser(user)}
                                    disabled={actionLoading === user.uuid}
                                    size="small"
                                  >
                                    {actionLoading === user.uuid ? (
                                      <CircularProgress size={20} />
                                    ) : (
                                      <BlockIcon />
                                    )}
                                  </IconButton>
                                </Tooltip>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Dialog open={confirmDialog.open} onClose={closeConfirmDialog}>
        <DialogTitle>
          Confirm {confirmDialog.action === "block" ? "Block" : "Unblock"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {confirmDialog.action} user "
            {confirmDialog.user?.email}"?
            {confirmDialog.action === "block"
              ? " This will prevent them from placing orders at your restaurant."
              : " This will allow them to place orders at your restaurant again."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog}>Cancel</Button>
          <Button
            onClick={confirmAction}
            color={confirmDialog.action === "block" ? "error" : "success"}
            variant="contained"
            disabled={!!actionLoading}
          >
            {actionLoading ? (
              <CircularProgress size={20} />
            ) : (
              (confirmDialog.action === "block" ? "Block" : "Unblock") +
              " Customer"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerManagement;
