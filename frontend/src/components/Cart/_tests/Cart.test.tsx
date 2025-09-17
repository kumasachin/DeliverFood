import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Cart } from "../Cart";

const mockUseAuth = jest.fn();
const mockUseCart = jest.fn();

jest.mock("../../contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock("../../contexts/CartContext", () => ({
  useCart: () => mockUseCart(),
}));

const renderCart = () => {
  return render(
    <BrowserRouter>
      <Cart />
    </BrowserRouter>
  );
};

describe("Cart Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows auth warning when user is not authenticated", () => {
    mockUseAuth.mockReturnValue({
      state: { isAuthenticated: false },
    });

    mockUseCart.mockReturnValue({
      state: { items: [] },
      updateQuantity: jest.fn(),
      removeItem: jest.fn(),
      clearCart: jest.fn(),
    });

    renderCart();

    expect(screen.getByTestId("cart-auth-warning")).toBeInTheDocument();
    expect(
      screen.getByText("Please sign in to view your cart.")
    ).toBeInTheDocument();
  });

  it("shows empty cart message when cart is empty", () => {
    mockUseAuth.mockReturnValue({
      state: { isAuthenticated: true },
    });

    mockUseCart.mockReturnValue({
      state: { items: [] },
      updateQuantity: jest.fn(),
      removeItem: jest.fn(),
      clearCart: jest.fn(),
    });

    renderCart();

    expect(screen.getByTestId("empty-cart-container")).toBeInTheDocument();
    expect(screen.getByTestId("empty-cart-title")).toBeInTheDocument();
    expect(screen.getByTestId("empty-cart-message")).toBeInTheDocument();
    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
    expect(
      screen.getByText("Add some delicious meals to get started!")
    ).toBeInTheDocument();
  });

  it("shows cart items when cart has items", () => {
    const mockCartItems = [
      {
        id: "1",
        name: "Pizza Margherita",
        price: 12.99,
        quantity: 2,
        image: "pizza.jpg",
      },
      {
        id: "2",
        name: "Burger Deluxe",
        price: 15.99,
        quantity: 1,
        image: "burger.jpg",
      },
    ];

    mockUseAuth.mockReturnValue({
      state: { isAuthenticated: true },
    });

    mockUseCart.mockReturnValue({
      state: {
        items: mockCartItems,
        total: 41.97,
      },
      updateQuantity: jest.fn(),
      removeItem: jest.fn(),
      clearCart: jest.fn(),
    });

    renderCart();

    expect(
      screen.queryByTestId("empty-cart-container")
    ).not.toBeInTheDocument();
  });
});
