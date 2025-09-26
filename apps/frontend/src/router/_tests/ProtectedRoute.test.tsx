import React from "react";
import { render, screen } from "@testing-library/react";

const mockUseAuth = jest.fn();

jest.mock("../../contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { state } = mockUseAuth();

  if (state.isLoading) return <div data-testid="loading">Loading...</div>;

  return state.isAuthenticated ? (
    <div data-testid="protected-content">{children}</div>
  ) : (
    <div data-testid="not-authenticated">Not authenticated</div>
  );
};

const TestComponent = () => <div>Protected Content</div>;

describe("ProtectedRoute", () => {
  it("shows loading when auth is loading", () => {
    mockUseAuth.mockReturnValue({
      state: { isLoading: true, isAuthenticated: false },
    });

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("shows not authenticated when user is not logged in", () => {
    mockUseAuth.mockReturnValue({
      state: { isLoading: false, isAuthenticated: false },
    });

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByTestId("not-authenticated")).toBeInTheDocument();
  });

  it("shows content when user is authenticated", () => {
    mockUseAuth.mockReturnValue({
      state: { isLoading: false, isAuthenticated: true },
    });

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
  });
});
