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
} from "@mui/material";
import {
  PersonOff as PersonOffIcon,
  PersonAddAlt as PersonAddAltIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { apiService } from "../../services/api";
import type { BlockedUser } from "../../services/api";

interface BlockedUsersManagementProps {
  title?: string;
}

export const BlockedUsersManagement: React.FC<BlockedUsersManagementProps> = ({
  title = "Blocked Users Management",
}) => {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    user: BlockedUser | null;
    action: "unblock";
  }>({
    open: false,
    user: null,
    action: "unblock",
  });

  const fetchBlockedUsers = async () => {
    try {
      setError(null);
      const users = await apiService.getBlockedUsers();
      setBlockedUsers(users);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch blocked users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const handleUnblockUser = async (user: BlockedUser) => {
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

      // Remove the user from the blocked list
      setBlockedUsers((prev) =>
        prev.filter((u) => u.uuid !== confirmDialog.user!.uuid)
      );

      setConfirmDialog({ open: false, user: null, action: "unblock" });
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to unblock user");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "error";
      case "owner":
        return "warning";
      case "customer":
        return "info";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight={200}
          >
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={3}>
            <PersonOffIcon sx={{ mr: 2, color: "error.main" }} />
            <Typography variant="h5" component="h1">
              {title}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {blockedUsers.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              minHeight={200}
              sx={{ color: "text.secondary" }}
            >
              <CheckCircleIcon
                sx={{ fontSize: 48, mb: 2, color: "success.main" }}
              />
              <Typography variant="h6" gutterBottom>
                No Blocked Users
              </Typography>
              <Typography variant="body2">
                All users are currently active. Blocked users will appear here.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Blocked Date</TableCell>
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
                          color={getRoleColor(user.role) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label="Blocked"
                          color="error"
                          size="small"
                          icon={<BlockIcon />}
                        />
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
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
                              <PersonAddAltIcon />
                            )}
                          </IconButton>
                        </Tooltip>
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
          setConfirmDialog({ open: false, user: null, action: "unblock" })
        }
      >
        <DialogTitle>Confirm Unblock</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to unblock user "{confirmDialog.user?.email}"?
            This will allow them to place orders again.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setConfirmDialog({ open: false, user: null, action: "unblock" })
            }
          >
            Cancel
          </Button>
          <Button
            onClick={confirmUnblock}
            color="success"
            variant="contained"
            disabled={!!actionLoading}
          >
            {actionLoading ? <CircularProgress size={20} /> : "Unblock User"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BlockedUsersManagement;
