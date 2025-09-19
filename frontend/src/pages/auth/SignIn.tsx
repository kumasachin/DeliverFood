import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Login } from "@mui/icons-material";
import { useAuth } from "contexts/AuthContext";
import { useFormState } from "hooks";
import { DLSTypography } from "dls/atoms/Typography";
import { DLSButton } from "dls/atoms/Button";
import { DLSInput } from "dls/atoms/Input";
import { Box, Paper, Alert } from "dls/atoms";

type SignInProps = {
  onSwitchToSignUp?: () => void;
};

export const SignIn = ({ onSwitchToSignUp }: SignInProps) => {
  const navigate = useNavigate();
  const { signIn, state, clearError } = useAuth();
  const { values, handleChange } = useFormState({
    email: "",
    password: "",
  });

  const handleInputChange = (field: "email" | "password", value: string) => {
    if (state.error) {
      clearError();
    }
    handleChange(field, value);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(values.email, values.password);
  };

  useEffect(() => {
    if (state.isAuthenticated && state.user && !state.error) {
      navigate("/restaurants");
    }
  }, [state.isAuthenticated, state.user, state.error, navigate]);

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
          <DLSTypography variant="h4" component="h1" data-testid="signin-title">
            Sign In
          </DLSTypography>
        </Box>

        {state.error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            data-testid="signin-error"
            id="signin-error"
          >
            {state.error}
          </Alert>
        )}
        <form onSubmit={handleLogin} data-testid="signin-form" noValidate>
          <DLSInput
            label="Email"
            type="email"
            value={values.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            fullWidth
            margin="normal"
            required
            aria-describedby={state.error ? "signin-error" : undefined}
            inputProps={{
              "data-testid": "email-input",
              "aria-label": "Email address",
            }}
          />
          <DLSInput
            label="Password"
            type="password"
            value={values.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            fullWidth
            margin="normal"
            required
            aria-describedby={state.error ? "signin-error" : undefined}
            inputProps={{
              "data-testid": "password-input",
              "aria-label": "Password",
            }}
          />
          <DLSButton
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={state.isLoading}
            data-testid="signin-submit-button"
            aria-describedby={state.error ? "signin-error" : undefined}
          >
            {state.isLoading ? "Signing In..." : "Sign In"}
          </DLSButton>
        </form>
        <DLSTypography align="center">
          Don't have an account?{" "}
          <DLSButton
            variant="text"
            sx={{
              color: "#1976d2",
              textDecoration: "underline",
              textTransform: "none",
              p: 0,
              minWidth: "auto",
            }}
            onClick={() =>
              onSwitchToSignUp ? onSwitchToSignUp() : navigate("/signup")
            }
            data-testid="signup-link"
            aria-label="Go to sign up page"
          >
            Sign up
          </DLSButton>
        </DLSTypography>
      </Paper>
    </Box>
  );
};
