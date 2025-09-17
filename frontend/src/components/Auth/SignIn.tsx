import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Paper, Alert } from "@mui/material";
import { Login } from "@mui/icons-material";
import { useAuth } from "contexts/AuthContext";
import { useFormState } from "hooks";
import { DLSTypography } from "dls/atoms/Typography";
import { DLSButton } from "dls/atoms/Button";
import { DLSInput } from "dls/atoms/Input";

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
          <DLSTypography variant="h4" component="h1">
            Sign In
          </DLSTypography>
        </Box>
        {state.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {state.error}
          </Alert>
        )}
        <form onSubmit={handleLogin}>
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
          <DLSButton
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={state.isLoading}
          >
            {state.isLoading ? "Signing In..." : "Sign In"}
          </DLSButton>
        </form>

        <DLSTypography align="center">
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
        </DLSTypography>
      </Paper>
    </Box>
  );
};
