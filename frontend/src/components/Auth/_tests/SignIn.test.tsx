import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { SignIn } from "../SignIn";
import { AuthProvider } from "../../../contexts/AuthContext";

const renderSignIn = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <SignIn />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe("SignIn Component", () => {
  it("renders login form", () => {
    renderSignIn();

    expect(screen.getByTestId("signin-title")).toBeInTheDocument();
    expect(screen.getByTestId("email-input")).toBeInTheDocument();
    expect(screen.getByTestId("password-input")).toBeInTheDocument();
    expect(screen.getByTestId("signin-submit-button")).toBeInTheDocument();
  });

  it("allows typing in form fields", () => {
    renderSignIn();

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("shows link to sign up page", () => {
    renderSignIn();

    expect(screen.getByTestId("signup-link")).toBeInTheDocument();
    expect(screen.getByTestId("signup-link")).toHaveTextContent("Sign up");
  });
});
