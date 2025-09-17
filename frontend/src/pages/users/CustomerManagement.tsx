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
  Tabs,
  Tab,
} from "@mui/material";
import {
  Search as SearchIcon,
  Block as BlockIcon,
  Person as PersonIcon,
  PersonOff as PersonOffIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { apiService } from "../../services/api";
import type { BlockedUser } from "../../services/api";

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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

export const CustomerManagement: React.FC<CustomerManagementProps> = ({
  title = "User Management",
}) => {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [blockedUsersLoading, setBlockedUsersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [foundUser, setFoundUser] = useState<Customer | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    user: Customer | null;
    action: "block" | "unblock";
  }>({
    open: false,
    user: null,
    action: "block",
  });

  // Fetch blocked users
  const fetchBlockedUsers = async () => {
    try {
      setBlockedUsersLoading(true);
      setError(null);
      const users = await apiService.getBlockedUsers();
      setBlockedUsers(users);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch blocked users");
    } finally {
      setBlockedUsersLoading(false);
    }
  };

  useEffect(() => {
    if (currentTab === 1) {
      fetchBlockedUsers();
    }
  }, [currentTab]);

  // Search for a customer by email
  const searchCustomers = async () => {
    if (!searchEmail.trim()) {
      setError("Please enter an email to search");
      return;
    }

    setLoading(true);
    setError(null);
    setFoundUser(null);
    setSuccess(null);

    try {
      const user = await apiService.searchUserByEmail(searchEmail.trim());
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

      // Update the found user status if it matches
      if (foundUser && foundUser.uuid === confirmDialog.user.uuid) {
        setFoundUser({ ...foundUser, status: "blocked" });
      }

      setSuccess(
        `User ${confirmDialog.user.email} has been blocked successfully`
      );
      setError(null);
      setConfirmDialog({ open: false, user: null, action: "block" });

      // Refresh blocked users list if we're on that tab
      if (currentTab === 1) {
        fetchBlockedUsers();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to block user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnblockUser = async (user: Customer) => {
    setConfirmDialog({
      open: true,
      user,
      action: "unblock",
    });
  };

  const confirmUnblock = async () => {
    if (!confirmDialog.user) return;

    try {
      setActionLoading(confirmDialog.user.uuid);
      await apiService.unblockUser(confirmDialog.user.uuid);

      // Remove from blocked users list
      setBlockedUsers((prev) =>
        prev.filter((u) => u.uuid !== confirmDialog.user!.uuid)
      );

      setSuccess(
        `User ${confirmDialog.user.email} has been unblocked successfully`
      );
      setError(null);
      setConfirmDialog({ open: false, user: null, action: "unblock" });
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to unblock user");
    } finally {
      setActionLoading(null);
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
              {error === "User not found with this email address" && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    <strong>Note:</strong> Only registered users can be found.
                    Make sure the email address is correct and the user has an
                    account.
                  </Typography>
                </Box>
              )}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
            <Tabs
              value={currentTab}
              onChange={(_, newValue) => setCurrentTab(newValue)}
            >
              <Tab label="Search & Manage Customers" />
              <Tab label="Blocked Users" />
            </Tabs>
          </Box>

          {/* Tab Panel 0: Search & Manage Customers */}
          <TabPanel value={currentTab} index={0}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Customer Management:
              </Typography>
              <Typography variant="body2" component="div">
                Search for customers by email address to manage their account
                status.
                <br />
                You can block customers who violate terms of service or cause
                issues.
              </Typography>
            </Alert>

            {/* Found User Display */}
            {foundUser && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Found User
                  </Typography>
                  <TableContainer component={Paper} elevation={0}>
                    <Table size="small">
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
                              color={
                                foundUser.status === "blocked"
                                  ? "error"
                                  : "success"
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(
                              foundUser.created_at
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell align="center">
                            {foundUser.status === "blocked" ? (
                              <Chip
                                label="Already Blocked"
                                color="error"
                                size="small"
                              />
                            ) : (
                              <Tooltip title="Block this user">
                                <IconButton
                                  color="error"
                                  onClick={() => handleBlockUser(foundUser)}
                                  disabled={actionLoading === foundUser.uuid}
                                  size="small"
                                >
                                  {actionLoading === foundUser.uuid ? (
                                    <CircularProgress size={20} />
                                  ) : (
                                    <BlockIcon />
                                  )}
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            )}
          </TabPanel>

          {/* Tab Panel 1: Blocked Users */}
          <TabPanel value={currentTab} index={1}>
            {blockedUsersLoading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : blockedUsers.length === 0 ? (
              <Alert severity="info">
                <Typography variant="h6" gutterBottom>
                  No blocked users
                </Typography>
                <Typography>
                  There are currently no blocked users. Search for customers in
                  the first tab to block them.
                </Typography>
              </Alert>
            ) : (
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <PersonOffIcon sx={{ mr: 1, color: "error.main" }} />
                    <Typography variant="h6">
                      Blocked Users ({blockedUsers.length})
                    </Typography>
                  </Box>
                  <TableContainer component={Paper} elevation={0}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Email</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell>Join Date</TableCell>
                          <TableCell align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {blockedUsers.map((user) => (
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
                              {new Date(user.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell align="center">
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
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            )}
          </TabPanel>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() =>
          setConfirmDialog({ open: false, user: null, action: "block" })
        }
      >
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
          <Button
            onClick={() =>
              setConfirmDialog({ open: false, user: null, action: "block" })
            }
          >
            Cancel
          </Button>
          <Button
            onClick={
              confirmDialog.action === "block" ? confirmBlock : confirmUnblock
            }
            color={confirmDialog.action === "block" ? "error" : "success"}
            variant="contained"
            disabled={!!actionLoading}
          >
            {actionLoading ? (
              <CircularProgress size={20} />
            ) : (
              `${
                confirmDialog.action === "block" ? "Block" : "Unblock"
              } Customer`
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerManagement;
