import React from "react";
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
  const { signUp, state } = useAuth();
  const { values, handleChange } = useFormState({
    email: "",
    password: "",
    name: "",
    role: "customer" as Role,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await signUp(values.email, values.password, values.name, values.role);
      navigate("/restaurants");
    } catch (err) {}
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
          <DLSTypography variant="h4" component="h1">
            Sign Up
          </DLSTypography>
        </Box>

        {state.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {state.error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <DLSInput
            label="Name"
            type="text"
            value={values.name}
            onChange={(e) => handleChange("name", e.target.value)}
            fullWidth
            margin="normal"
            required
          />

          <DLSInput
            label="Email"
            type="email"
            value={values.email}
            onChange={(e) => handleChange("email", e.target.value)}
            fullWidth
            margin="normal"
            required
          />

          <DLSInput
            label="Password"
            type="password"
            value={values.password}
            onChange={(e) => handleChange("password", e.target.value)}
            fullWidth
            margin="normal"
            required
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={values.role}
              label="Role"
              onChange={(e) => handleChange("role", e.target.value as Role)}
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
            onClick={onSwitchToSignIn}
          >
            Sign in
          </span>
        </DLSTypography>
      </Paper>
    </Box>
  );
};
