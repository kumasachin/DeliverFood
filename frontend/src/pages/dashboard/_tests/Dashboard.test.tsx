import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { dlsTheme } from "../../../dls/theme";
import { Dashboard } from "../Dashboard";
import { User } from "../../../types/auth";

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

const mockAuthActions = {
  signIn: jest.fn(),
  signUp: jest.fn(),
  logout: jest.fn(),
  clearError: jest.fn(),
};

jest.mock("../../../contexts/AuthContext", () => ({
  ...jest.requireActual("../../../contexts/AuthContext"),
  useAuth: () => ({
    state: mockAuthState,
    ...mockAuthActions,
  }),
}));

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={dlsTheme}>{children}</ThemeProvider>
);

describe("Dashboard Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Layout and Basic Elements", () => {
    it("should render dashboard title", () => {
      render(
        <DashboardWrapper>
          <Dashboard />
        </DashboardWrapper>
      );

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Dashboard"
      );
    });

    it("should show available features section", () => {
      render(
        <DashboardWrapper>
          <Dashboard />
        </DashboardWrapper>
      );

      expect(screen.getByText("Available features:")).toBeInTheDocument();
      expect(
        screen.getByText("Browse restaurants and view their menus")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Add meals to cart and place orders")
      ).toBeInTheDocument();
    });
  });

  describe("Authentication States", () => {
    it("should show sign-in warning when not authenticated", () => {
      mockAuthState.isAuthenticated = false;
      mockAuthState.user = null;

      render(
        <DashboardWrapper>
          <Dashboard />
        </DashboardWrapper>
      );

      const warningAlert = screen.getByRole("alert");
      expect(warningAlert).toHaveTextContent(
        "Please sign in to access the dashboard."
      );
      expect(warningAlert).toHaveClass("MuiAlert-colorWarning");
    });

    it("should show welcome message when authenticated", () => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.user = {
        id: "test-id",
        email: "test@example.com",
        name: "Test User",
        role: "customer",
        isActive: true,
      };

      render(
        <DashboardWrapper>
          <Dashboard />
        </DashboardWrapper>
      );

      const successAlert = screen.getByRole("alert");
      expect(successAlert).toHaveTextContent(
        "Welcome test@example.com! You are signed in as a customer."
      );
      expect(successAlert).toHaveClass("MuiAlert-colorSuccess");
    });
  });

  describe("Role-based Feature Display", () => {
    beforeEach(() => {
      mockAuthState.isAuthenticated = true;
    });

    it("should show customer-specific features for customer role", () => {
      mockAuthState.user = {
        id: "customer-id",
        email: "customer@example.com",
        name: "Customer User",
        role: "customer",
        isActive: true,
      };

      render(
        <DashboardWrapper>
          <Dashboard />
        </DashboardWrapper>
      );

      expect(
        screen.getByText("View your order history and track deliveries")
      ).toBeInTheDocument();

      expect(
        screen.queryByText("Manage your restaurant orders and update status")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("Search and manage customer accounts")
      ).not.toBeInTheDocument();

      expect(
        screen.queryByText("Full system administration and order oversight")
      ).not.toBeInTheDocument();
    });

    it("should show owner-specific features for owner role", () => {
      mockAuthState.user = {
        id: "owner-id",
        email: "owner@example.com",
        name: "Owner User",
        role: "owner",
        isActive: true,
      };

      render(
        <DashboardWrapper>
          <Dashboard />
        </DashboardWrapper>
      );

      expect(
        screen.getByText("Manage your restaurant orders and update status")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Search and manage customer accounts")
      ).toBeInTheDocument();

      expect(
        screen.queryByText("View your order history and track deliveries")
      ).not.toBeInTheDocument();

      expect(
        screen.queryByText("Full system administration and order oversight")
      ).not.toBeInTheDocument();
    });

    it("should show admin-specific features for admin role", () => {
      mockAuthState.user = {
        id: "admin-id",
        email: "admin@example.com",
        name: "Admin User",
        role: "admin",
        isActive: true,
      };

      render(
        <DashboardWrapper>
          <Dashboard />
        </DashboardWrapper>
      );

      expect(
        screen.getByText("Full system administration and order oversight")
      ).toBeInTheDocument();

      expect(
        screen.queryByText("View your order history and track deliveries")
      ).not.toBeInTheDocument();

      expect(
        screen.queryByText("Manage your restaurant orders and update status")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("Search and manage customer accounts")
      ).not.toBeInTheDocument();
    });
  });

  describe("Component Structure", () => {
    it("should render features as an unordered list", () => {
      render(
        <DashboardWrapper>
          <Dashboard />
        </DashboardWrapper>
      );

      const list = screen.getByRole("list");
      expect(list).toBeInTheDocument();

      const listItems = screen.getAllByRole("listitem");
      expect(listItems.length).toBeGreaterThanOrEqual(2); // At least 2 basic features
    });
  });

  describe("User Email Display", () => {
    it("should display the correct user email in welcome message", () => {
      const testEmail = "unique.email@test.com";
      mockAuthState.isAuthenticated = true;
      mockAuthState.user = {
        id: "test-id",
        email: testEmail,
        name: "Test User",
        role: "customer",
        isActive: true,
      };

      render(
        <DashboardWrapper>
          <Dashboard />
        </DashboardWrapper>
      );

      expect(
        screen.getByText(
          `Welcome ${testEmail}! You are signed in as a customer.`
        )
      ).toBeInTheDocument();
    });

    it("should display the correct user role in welcome message", () => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.user = {
        id: "test-id",
        email: "test@example.com",
        name: "Test User",
        role: "owner",
        isActive: true,
      };

      render(
        <DashboardWrapper>
          <Dashboard />
        </DashboardWrapper>
      );

      expect(
        screen.getByText(
          "Welcome test@example.com! You are signed in as a owner."
        )
      ).toBeInTheDocument();
    });
  });
});
