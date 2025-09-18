import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchBar } from "../SearchBar";
import { Loading } from "../Loading";
import { EmptyState } from "../EmptyState";

describe("SearchBar Component", () => {
  it("renders with placeholder text", () => {
    const mockOnChange = jest.fn();

    render(
      <SearchBar
        value=""
        onChange={mockOnChange}
        placeholder="Search restaurants..."
      />
    );

    const input = screen.getByTestId("search-input");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("placeholder", "Search restaurants...");
  });

  it("calls onChange when typing", () => {
    const mockOnChange = jest.fn();

    render(<SearchBar value="" onChange={mockOnChange} />);

    const input = screen.getByTestId("search-input");
    fireEvent.change(input, { target: { value: "pizza" } });

    expect(mockOnChange).toHaveBeenCalledWith("pizza");
  });

  it("displays current value", () => {
    const mockOnChange = jest.fn();

    render(<SearchBar value="current search" onChange={mockOnChange} />);

    const input = screen.getByTestId("search-input");
    expect(input).toHaveValue("current search");
  });
});

describe("Loading Component", () => {
  it("renders loading message", () => {
    render(<Loading message="Loading data..." />);

    expect(screen.getByText("Loading data...")).toBeInTheDocument();
  });

  it("renders default message when no message provided", () => {
    render(<Loading />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});

describe("EmptyState Component", () => {
  it("renders empty state message", () => {
    render(<EmptyState message="No items found" />);

    expect(screen.getByText("No items found")).toBeInTheDocument();
  });

  it("renders with icon when provided", () => {
    const testIcon = (
      <div data-testid="test-icon">
        <span>test-icon</span>
      </div>
    );

    render(<EmptyState message="No data" icon={testIcon} />);

    expect(screen.getByText("No data")).toBeInTheDocument();
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });
});
