import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../AuthContext";
import { apiService } from "../../services";
jest.mock("../../services", () => ({
  apiService: {
    login: jest.fn(),
    register: jest.fn(),
    setAuthToken: jest.fn(),
    clearAuthToken: jest.fn(),
  },
}));
const createMockLocalStorage = () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
});
const mockLocalStorage = createMockLocalStorage();
Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});
const AuthTestHelper = () => {
  const { state, signIn, signUp, logout, clearError } = useAuth();
  const handleCustomerLogin = () => {
    signIn("customer@test.com", "password123");
  };
  const handleAdminLogin = () => {
    signIn("admin@test.com", "password123");
  };
  const handleOwnerLogin = () => {
    signIn("owner@restaurant.com", "password123");
  };
  const handleSignUp = () => {
    signUp("new@test.com", "password123", "New User", "customer");
  };
  return (
    <div>
      <div data-testid="authenticated">
        {state.isAuthenticated ? "true" : "false"}
      </div>
      <div data-testid="user-email">{state.user?.email || "none"}</div>
      <div data-testid="user-role">{state.user?.role || "none"}</div>
      <div data-testid="loading">{state.isLoading ? "true" : "false"}</div>
      <div data-testid="error">{state.error || "none"}</div>
      <button data-testid="signin-customer-btn" onClick={handleCustomerLogin}>
        Sign In as Customer
      </button>
      <button data-testid="signin-admin-btn" onClick={handleAdminLogin}>
        Sign In as Admin
      </button>
      <button data-testid="signin-owner-btn" onClick={handleOwnerLogin}>
        Sign In as Restaurant Owner
      </button>
      <button data-testid="signup-btn" onClick={handleSignUp}>
        Create New Account
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Sign Out
      </button>
      <button data-testid="clear-error-btn" onClick={clearError}>
        Clear Error Message
      </button>
    </div>
  );
};
describe("Authentication Context - Happy Path Testing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });
  test("starts with user logged out", () => {
    render(
      <AuthProvider>
        <AuthTestHelper />
      </AuthProvider>
    );
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("user-email")).toHaveTextContent("none");
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("error")).toHaveTextContent("none");
  });
  test("automatically logs in user when valid data exists in localStorage", () => {
    const existingUser = {
      id: "user-123",
      email: "returning@user.com",
      name: "Returning User",
      role: "customer",
      isActive: true,
    };
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === "authToken") return "existing-auth-token";
      if (key === "userData") return JSON.stringify(existingUser);
      return null;
    });
    render(
      <AuthProvider>
        <AuthTestHelper />
      </AuthProvider>
    );
    expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    expect(screen.getByTestId("user-email")).toHaveTextContent(
      "returning@user.com"
    );
    expect(screen.getByTestId("user-role")).toHaveTextContent("customer");
  });
  test("allows customer to sign in successfully", async () => {
    const customerLoginResponse = {
      token: "customer-auth-token",
      uuid: "customer-123",
      email: "customer@test.com",
      role: "customer",
    };
    (apiService.login as jest.Mock).mockResolvedValue(customerLoginResponse);
    render(
      <AuthProvider>
        <AuthTestHelper />
      </AuthProvider>
    );
    await act(async () => {
      screen.getByTestId("signin-customer-btn").click();
    });
    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    });
    expect(screen.getByTestId("user-email")).toHaveTextContent(
      "customer@test.com"
    );
    expect(screen.getByTestId("user-role")).toHaveTextContent("customer");
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("error")).toHaveTextContent("none");
  });
  test("allows admin to sign in successfully", async () => {
    const adminLoginResponse = {
      token: "admin-auth-token",
      uuid: "admin-456",
      email: "admin@test.com",
      role: "admin",
    };
    (apiService.login as jest.Mock).mockResolvedValue(adminLoginResponse);
    render(
      <AuthProvider>
        <AuthTestHelper />
      </AuthProvider>
    );
    await act(async () => {
      screen.getByTestId("signin-admin-btn").click();
    });
    await waitFor(() => {
      expect(screen.getByTestId("user-role")).toHaveTextContent("admin");
    });
    expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    expect(screen.getByTestId("user-email")).toHaveTextContent(
      "admin@test.com"
    );
  });
  test("allows restaurant owner to sign in successfully", async () => {
    const ownerLoginResponse = {
      token: "owner-auth-token",
      uuid: "owner-789",
      email: "owner@restaurant.com",
      role: "owner",
    };
    (apiService.login as jest.Mock).mockResolvedValue(ownerLoginResponse);
    render(
      <AuthProvider>
        <AuthTestHelper />
      </AuthProvider>
    );
    await act(async () => {
      screen.getByTestId("signin-owner-btn").click();
    });
    await waitFor(() => {
      expect(screen.getByTestId("user-role")).toHaveTextContent("owner");
    });
    expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    expect(screen.getByTestId("user-email")).toHaveTextContent(
      "owner@restaurant.com"
    );
  });
  it("should successfully sign in an admin", async () => {
    const adminResponse = {
      token: "admin-token",
      uuid: "admin-456",
      email: "admin@test.com",
      role: "admin",
    };
    (apiService.login as jest.Mock).mockResolvedValue(adminResponse);
    render(
      <AuthProvider>
        <AuthTestHelper />
      </AuthProvider>
    );
    await act(async () => {
      screen.getByTestId("signin-admin-btn").click();
    });
    await waitFor(() => {
      expect(screen.getByTestId("user-role")).toHaveTextContent("admin");
    });
    expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    expect(screen.getByTestId("user-email")).toHaveTextContent(
      "admin@test.com"
    );
  });
  it("should successfully sign in a restaurant owner", async () => {
    const ownerResponse = {
      token: "owner-token",
      uuid: "owner-789",
      email: "owner@restaurant.com",
      role: "owner",
    };
    (apiService.login as jest.Mock).mockResolvedValue(ownerResponse);
    render(
      <AuthProvider>
        <AuthTestHelper />
      </AuthProvider>
    );
    await act(async () => {
      screen.getByTestId("signin-owner-btn").click();
    });
    await waitFor(() => {
      expect(screen.getByTestId("user-role")).toHaveTextContent("owner");
    });
    expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    expect(screen.getByTestId("user-email")).toHaveTextContent(
      "owner@restaurant.com"
    );
  });
  it("should successfully register a new customer", async () => {
    const registerResponse = {
      token: "signup-token",
      uuid: "new-user-101",
      email: "newcustomer@test.com",
      role: "customer",
    };
    (apiService.register as jest.Mock).mockResolvedValue(registerResponse);
    render(
      <AuthProvider>
        <AuthTestHelper />
      </AuthProvider>
    );
    await act(async () => {
      screen.getByTestId("signup-btn").click();
    });
    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    });
    expect(screen.getByTestId("user-email")).toHaveTextContent(
      "newcustomer@test.com"
    );
    expect(screen.getByTestId("user-role")).toHaveTextContent("customer");
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
  });
  it("should successfully log out authenticated user", async () => {
    const loginResponse = {
      token: "auth-token",
      uuid: "user-123",
      email: "customer@test.com",
      role: "customer",
    };
    (apiService.login as jest.Mock).mockResolvedValue(loginResponse);
    render(
      <AuthProvider>
        <AuthTestHelper />
      </AuthProvider>
    );
    await act(async () => {
      screen.getByTestId("signin-customer-btn").click();
    });
    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    });
    act(() => {
      screen.getByTestId("logout-btn").click();
    });
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("user-email")).toHaveTextContent("none");
    expect(screen.getByTestId("user-role")).toHaveTextContent("none");
    expect(apiService.clearAuthToken).toHaveBeenCalled();
  });
  it("should clear errors when requested", async () => {
    (apiService.login as jest.Mock).mockRejectedValue({
      response: { data: { message: "Invalid credentials" } },
    });
    render(
      <AuthProvider>
        <AuthTestHelper />
      </AuthProvider>
    );
    await act(async () => {
      screen.getByTestId("signin-customer-btn").click();
    });
    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent(
        "Invalid credentials"
      );
    });
    act(() => {
      screen.getByTestId("clear-error-btn").click();
    });
    expect(screen.getByTestId("error")).toHaveTextContent("none");
  });
  it("should show loading during authentication", async () => {
    let resolveLogin: (value: any) => void;
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });
    (apiService.login as jest.Mock).mockReturnValue(loginPromise);
    render(
      <AuthProvider>
        <AuthTestHelper />
      </AuthProvider>
    );
    act(() => {
      screen.getByTestId("signin-customer-btn").click();
    });
    expect(screen.getByTestId("loading")).toHaveTextContent("true");
    await act(async () => {
      resolveLogin!({
        token: "token",
        uuid: "123",
        email: "customer@test.com",
        role: "customer",
      });
    });
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
  });
});
