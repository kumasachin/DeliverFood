import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { SignUp } from "../SignUp";
import { AuthProvider } from "../../../contexts/AuthContext";

const renderSignUp = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <SignUp />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe("SignUp Component", () => {
  it("renders signup form", () => {
    renderSignUp();

    expect(screen.getByTestId("signup-title")).toBeInTheDocument();
    expect(screen.getByTestId("name-input")).toBeInTheDocument();
    expect(screen.getByTestId("email-input")).toBeInTheDocument();
    expect(screen.getByTestId("password-input")).toBeInTheDocument();
    expect(screen.getByTestId("role-select")).toBeInTheDocument();
    expect(screen.getByTestId("signup-submit-button")).toBeInTheDocument();
  });

  it("allows typing in form fields", () => {
    renderSignUp();

    const nameInput = screen.getByTestId("name-input");
    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");

    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(nameInput).toHaveValue("John Doe");
    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("shows link to sign in page", () => {
    renderSignUp();

    expect(screen.getByTestId("signin-link")).toBeInTheDocument();
    expect(screen.getByTestId("signin-link")).toHaveTextContent("Sign in");
  });
});
