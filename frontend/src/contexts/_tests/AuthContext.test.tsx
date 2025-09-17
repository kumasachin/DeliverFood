import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../AuthContext";
import { apiService } from "../../services";

// Mock the API service
jest.mock("../../services", () => ({
  apiService: {
    login: jest.fn(),
    register: jest.fn(),
    setAuthToken: jest.fn(),
    clearAuthToken: jest.fn(),
  },
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

// Test component to access auth context
const TestComponent: React.FC = () => {
  const { user, loading, error, signIn, signUp, logOut } = useAuth();

  return (
    <div>
      <div data-testid="user">{user ? JSON.stringify(user) : "null"}</div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="error">{error || "null"}</div>
      <button onClick={() => signIn("test@example.com", "password")}>
        Sign In
      </button>
      <button
        onClick={() => signUp("test@example.com", "password", "Test User")}
      >
        Sign Up
      </button>
      <button onClick={logOut}>Log Out</button>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it("should initialize with default state", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("user")).toHaveTextContent("null");
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("error")).toHaveTextContent("null");
  });

  it("should restore user from localStorage on initialization", () => {
    const mockUser = {
      id: "123",
      email: "test@example.com",
      name: "Test User",
      role: "customer" as const,
      isActive: true,
    };

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("user")).toHaveTextContent(
      JSON.stringify(mockUser)
    );
  });

  it("should handle successful sign in", async () => {
    const mockResponse = {
      token: "mock-token",
      uuid: "123",
      email: "test@example.com",
      role: "customer",
    };

    (apiService.login as jest.Mock).mockResolvedValue(mockResponse);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText("Sign In").click();
    });

    await waitFor(() => {
      expect(apiService.setAuthToken).toHaveBeenCalledWith("mock-token");
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "userData",
        expect.stringContaining("test@example.com")
      );
    });
  });

  it("should handle sign in error", async () => {
    const mockError = {
      response: {
        data: {
          error: "Invalid credentials",
        },
      },
    };

    (apiService.login as jest.Mock).mockRejectedValue(mockError);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText("Sign In").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent(
        "Invalid credentials"
      );
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
  });

  it("should handle successful sign up", async () => {
    const mockResponse = {
      token: "mock-token",
      uuid: "123",
      email: "test@example.com",
      role: "customer",
    };

    (apiService.register as jest.Mock).mockResolvedValue(mockResponse);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText("Sign Up").click();
    });

    await waitFor(() => {
      expect(apiService.setAuthToken).toHaveBeenCalledWith("mock-token");
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "userData",
        expect.stringContaining("test@example.com")
      );
    });
  });

  it("should handle sign up error", async () => {
    const mockError = {
      response: {
        data: {
          message: "Email already exists",
        },
      },
    };

    (apiService.register as jest.Mock).mockRejectedValue(mockError);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText("Sign Up").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent(
        "Email already exists"
      );
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
  });

  it("should handle logout", () => {
    const mockUser = {
      id: "123",
      email: "test@example.com",
      name: "Test User",
      role: "customer" as const,
      isActive: true,
    };

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    act(() => {
      screen.getByText("Log Out").click();
    });

    expect(apiService.clearAuthToken).toHaveBeenCalled();
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("userData");
    expect(screen.getByTestId("user")).toHaveTextContent("null");
  });

  it("should set loading state during authentication", async () => {
    (apiService.login as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    act(() => {
      screen.getByText("Sign In").click();
    });

    expect(screen.getByTestId("loading")).toHaveTextContent("true");

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
  });
});
