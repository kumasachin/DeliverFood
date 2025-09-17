import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Checkout } from "../Checkout";

const mockUseAuth = jest.fn();
const mockUseCart = jest.fn();
const mockUseCheckoutProcess = jest.fn();

jest.mock("../../contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock("../../contexts/CartContext", () => ({
  useCart: () => mockUseCart(),
}));

jest.mock("../../hooks", () => ({
  useCheckoutProcess: () => mockUseCheckoutProcess(),
}));

const renderCheckout = () => {
  return render(
    <BrowserRouter>
      <Checkout />
    </BrowserRouter>
  );
};

describe("Checkout Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows auth warning when user is not authenticated", () => {
    mockUseAuth.mockReturnValue({
      state: { isAuthenticated: false },
    });

    mockUseCart.mockReturnValue({
      state: { items: [] },
    });

    renderCheckout();

    expect(
      screen.getByText(/please sign in/i) || screen.getByText(/login required/i)
    ).toBeInTheDocument();
  });

  it("shows empty cart message when cart is empty", () => {
    mockUseAuth.mockReturnValue({
      state: { isAuthenticated: true },
    });

    mockUseCart.mockReturnValue({
      state: { items: [] },
    });

    renderCheckout();

    expect(
      screen.getByText(/cart is empty/i) || screen.getByText(/no items/i)
    ).toBeInTheDocument();
  });

  it("renders checkout form when user is authenticated and has items", () => {
    const mockCartItems = [
      {
        id: "1",
        name: "Pizza",
        price: 12.99,
        quantity: 1,
      },
    ];

    mockUseAuth.mockReturnValue({
      state: {
        isAuthenticated: true,
        user: { id: "1", email: "test@example.com" },
      },
    });

    mockUseCart.mockReturnValue({
      state: {
        items: mockCartItems,
        total: 12.99,
      },
    });

    mockUseCheckoutProcess.mockReturnValue({
      isProcessing: false,
      processOrder: jest.fn(),
      error: null,
    });

    renderCheckout();

    expect(
      screen.getByText(/checkout/i) || screen.getByText(/order/i)
    ).toBeInTheDocument();
  });
});
