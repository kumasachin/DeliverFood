import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Role } from "../../types/auth";

type SignUpProps = {
  onSignUp?: (email: string, role: Role) => void;
  onSwitchToSignIn?: () => void;
};

export const SignUp = ({ onSignUp, onSwitchToSignIn }: SignUpProps) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [role, setRole] = useState<Role>("customer");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Signup attempt:", { email, password, role });

      if (email && password) {
        onSignUp?.(email, role);
      }
    } catch (err) {
      setError("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: "100%" }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Sign Up
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={role}
              label="Role"
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <MenuItem value="customer">Customer</MenuItem>
              <MenuItem value="owner">Restaurant Owner</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>

        <Typography align="center">
          Already have an account?{" "}
          <span
            style={{
              color: "#1976d2",
              cursor: "pointer",
              textDecoration: "underline",
            }}
            onClick={onSwitchToSignIn}
          >
            Sign in
          </span>
        </Typography>
      </Paper>
    </Box>
  );
};
