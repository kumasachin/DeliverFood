import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { PersonAdd } from "@mui/icons-material";
import { Role } from "types/auth";
import { useAuth } from "contexts/AuthContext";
import { useFormState } from "hooks";
import { DLSTypography } from "dls/atoms/Typography";
import { DLSButton } from "dls/atoms/Button";
import { DLSInput } from "dls/atoms/Input";

type SignUpProps = {
  onSwitchToSignIn?: () => void;
};

export const SignUp = ({ onSwitchToSignIn }: SignUpProps) => {
  const navigate = useNavigate();
  const { signUp, state, clearError } = useAuth();
  const { values, handleChange } = useFormState({
    email: "",
    password: "",
    name: "",
    role: "customer" as Role,
  });

  const handleInputChange = (
    field: "email" | "password" | "name" | "role",
    value: string
  ) => {
    if (state.error) {
      clearError();
    }
    handleChange(field, value);
  };

  useEffect(() => {
    if (state.isAuthenticated && state.user) {
      navigate("/restaurants");
    }
  }, [state.isAuthenticated, state.user, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await signUp(values.email, values.password, values.name, values.role);
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
          <PersonAdd sx={{ mr: 2, fontSize: 32 }} />
          <DLSTypography variant="h4" component="h1" data-testid="signup-title">
            Sign Up
          </DLSTypography>
        </Box>

        {state.error && (
          <Alert severity="error" sx={{ mb: 2 }} data-testid="signup-error">
            {state.error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} data-testid="signup-form">
          <DLSInput
            label="Name"
            type="text"
            value={values.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            fullWidth
            margin="normal"
            required
            inputProps={{ "data-testid": "name-input" }}
          />

          <DLSInput
            label="Email"
            type="email"
            value={values.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            fullWidth
            margin="normal"
            required
            inputProps={{ "data-testid": "email-input" }}
          />

          <DLSInput
            label="Password"
            type="password"
            value={values.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            fullWidth
            margin="normal"
            required
            inputProps={{ "data-testid": "password-input" }}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={values.role}
              label="Role"
              onChange={(e) =>
                handleInputChange("role", e.target.value as Role)
              }
              data-testid="role-select"
            >
              <MenuItem value="customer">Customer</MenuItem>
              <MenuItem value="owner">Restaurant Owner</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>

          <DLSButton
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={state.isLoading}
            data-testid="signup-submit-button"
          >
            {state.isLoading ? "Creating Account..." : "Sign Up"}
          </DLSButton>
        </form>

        <DLSTypography align="center">
          Already have an account?{" "}
          <span
            style={{
              color: "#1976d2",
              cursor: "pointer",
              textDecoration: "underline",
            }}
            onClick={() =>
              onSwitchToSignIn ? onSwitchToSignIn() : navigate("/signin")
            }
            data-testid="signin-link"
          >
            Sign in
          </span>
        </DLSTypography>
      </Paper>
    </Box>
  );
};
