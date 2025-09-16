import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
} from "@mui/material";
import { Login } from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { useFormState } from "../../hooks";

type SignInProps = {
  onSwitchToSignUp?: () => void;
};

export const SignIn = ({ onSwitchToSignUp }: SignInProps) => {
  const navigate = useNavigate();
  const { signIn, state } = useAuth();
  const { values, handleChange } = useFormState({
    email: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await signIn(values.email, values.password);
      navigate("/restaurants");
    } catch (err) {
      // Error is handled by AuthContext
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
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{ mb: 3 }}
        >
          <Login sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            Sign In
          </Typography>
        </Box>
        {state.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {state.error}
          </Alert>
        )}
        <form onSubmit={handleLogin}>
          <TextField
            label="Email"
            type="email"
            value={values.email}
            onChange={(e) => handleChange("email", e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Password"
            type="password"
            value={values.password}
            onChange={(e) => handleChange("password", e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={state.isLoading}
          >
            {state.isLoading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        <Typography align="center">
          Don't have an account?{" "}
          <span
            style={{
              color: "#1976d2",
              cursor: "pointer",
              textDecoration: "underline",
            }}
            onClick={onSwitchToSignUp}
          >
            Sign up
          </span>
        </Typography>
      </Paper>
    </Box>
  );
};
