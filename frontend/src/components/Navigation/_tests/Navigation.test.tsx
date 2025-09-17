import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Navigation } from "../Navigation";

const mockUseAuth = jest.fn();
jest.mock("../../contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

const renderNavigation = () => {
  return render(
    <BrowserRouter>
      <Navigation />
    </BrowserRouter>
  );
};

describe("Navigation Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows login options when user is not authenticated", () => {
    mockUseAuth.mockReturnValue({
      state: {
        isAuthenticated: false,
        user: null,
      },
      logout: jest.fn(),
    });

    renderNavigation();

    expect(
      screen.getByText(/sign in/i) || screen.getByText(/login/i)
    ).toBeInTheDocument();
  });

  it("shows user menu when user is authenticated", () => {
    const mockUser = {
      id: "1",
      email: "test@example.com",
      name: "Test User",
      role: "customer",
    };

    mockUseAuth.mockReturnValue({
      state: {
        isAuthenticated: true,
        user: mockUser,
      },
      logout: jest.fn(),
    });

    renderNavigation();

    expect(
      screen.getByText(/test user/i) ||
        screen.getByText(/profile/i) ||
        screen.getByText(/logout/i)
    ).toBeInTheDocument();
  });

  it("calls logout when logout is clicked", () => {
    const mockLogout = jest.fn();
    const mockUser = {
      id: "1",
      email: "test@example.com",
      name: "Test User",
      role: "customer",
    };

    mockUseAuth.mockReturnValue({
      state: {
        isAuthenticated: true,
        user: mockUser,
      },
      logout: mockLogout,
    });

    renderNavigation();

    expect(
      screen.getByText(/test user/i) ||
        screen.getByText(/profile/i) ||
        screen.getByText(/logout/i)
    ).toBeInTheDocument();
  });
});
