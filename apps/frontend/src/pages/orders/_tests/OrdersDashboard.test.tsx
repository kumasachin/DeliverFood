import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { OrdersDashboard } from "../OrdersDashboard";
import { User } from "../../../types/auth";

const theme = createTheme();

jest.mock("../../../services", () => ({
  apiService: {
    login: jest.fn(),
    register: jest.fn(),
    setAuthToken: jest.fn(),
    clearAuthToken: jest.fn(),
  },
}));

let mockAuthState: {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
} = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const mockAuthContext = {
  state: mockAuthState,
  dispatch: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  clearError: jest.fn(),
};

jest.mock("../../../contexts/AuthContext", () => ({
  useAuth: () => mockAuthContext,
}));

jest.mock("../CustomerOrdersDashboard", () => ({
  CustomerOrdersDashboard: () => (
    <div data-testid="customer-orders-dashboard">Customer Orders Dashboard</div>
  ),
}));

jest.mock("../RestaurantOrdersDashboard", () => ({
  RestaurantOrdersDashboard: () => (
    <div data-testid="restaurant-orders-dashboard">
      Restaurant Orders Dashboard
    </div>
  ),
}));

jest.mock("../AdminOrdersDashboard", () => ({
  AdminOrdersDashboard: () => (
    <div data-testid="admin-orders-dashboard">Admin Orders Dashboard</div>
  ),
}));

describe("OrdersDashboard Page Component", () => {
  const renderWithAuth = (authState: any) => {
    mockAuthContext.state = authState;

    return render(
      <ThemeProvider theme={theme}>
        <OrdersDashboard />
      </ThemeProvider>
    );
  };

  describe("Authentication States", () => {
    it("should show sign in prompt when not authenticated", () => {
      renderWithAuth({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
      });

      expect(
        screen.getByText("Please sign in to view orders.")
      ).toBeInTheDocument();
    });

    it("should show sign in prompt when user is null", () => {
      renderWithAuth({
        isAuthenticated: true,
        user: null,
        isLoading: false,
        error: null,
      });

      expect(
        screen.getByText("Please sign in to view orders.")
      ).toBeInTheDocument();
    });
  });

  describe("Role-Based Dashboard Rendering", () => {
    it("should render CustomerOrdersDashboard for customer role", () => {
      renderWithAuth({
        isAuthenticated: true,
        user: { id: "1", email: "customer@test.com", role: "customer" },
        isLoading: false,
        error: null,
      });

      expect(
        screen.getByTestId("customer-orders-dashboard")
      ).toBeInTheDocument();
      expect(screen.getByText("Customer Orders Dashboard")).toBeInTheDocument();
    });

    it("should render RestaurantOrdersDashboard for owner role", () => {
      renderWithAuth({
        isAuthenticated: true,
        user: { id: "2", email: "owner@test.com", role: "owner" },
        isLoading: false,
        error: null,
      });

      expect(
        screen.getByTestId("restaurant-orders-dashboard")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Restaurant Orders Dashboard")
      ).toBeInTheDocument();
    });

    it("should render AdminOrdersDashboard for admin role", () => {
      renderWithAuth({
        isAuthenticated: true,
        user: { id: "3", email: "admin@test.com", role: "admin" },
        isLoading: false,
        error: null,
      });

      expect(screen.getByTestId("admin-orders-dashboard")).toBeInTheDocument();
      expect(screen.getByText("Admin Orders Dashboard")).toBeInTheDocument();
    });

    it("should show error message for invalid role", () => {
      renderWithAuth({
        isAuthenticated: true,
        user: { id: "4", email: "invalid@test.com", role: "invalid" },
        isLoading: false,
        error: null,
      });

      expect(screen.getByText("Invalid user role.")).toBeInTheDocument();
    });
  });

  describe("Component Structure", () => {
    it("should render within a container when not authenticated", () => {
      renderWithAuth({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
      });

      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveClass("MuiAlert-standardWarning");
    });

    it("should render within a container for invalid role", () => {
      renderWithAuth({
        isAuthenticated: true,
        user: { id: "4", email: "invalid@test.com", role: "invalid" },
        isLoading: false,
        error: null,
      });

      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveClass("MuiAlert-standardError");
    });
  });

  describe("User Data Handling", () => {
    it("should handle different user properties correctly", () => {
      const user = {
        id: "test-id",
        email: "test@example.com",
        role: "customer",
        name: "Test User",
      };

      renderWithAuth({
        isAuthenticated: true,
        user,
        isLoading: false,
        error: null,
      });

      expect(
        screen.getByTestId("customer-orders-dashboard")
      ).toBeInTheDocument();
    });

    it("should prioritize authentication and user presence over role", () => {
      renderWithAuth({
        isAuthenticated: false,
        user: { id: "1", email: "customer@test.com", role: "customer" },
        isLoading: false,
        error: null,
      });

      expect(
        screen.getByText("Please sign in to view orders.")
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId("customer-orders-dashboard")
      ).not.toBeInTheDocument();
    });
  });
});
