import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchBar } from "../SearchBar";
import { Loading } from "../Loading";
import { EmptyState } from "../EmptyState";

describe("SearchBar Component", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("renders with placeholder text", () => {
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

  it("renders with default placeholder when none provided", () => {
    render(<SearchBar value="" onChange={mockOnChange} />);

    const input = screen.getByTestId("search-input");
    expect(input).toHaveAttribute("placeholder", "Search...");
  });

  it("calls onChange when typing", () => {
    render(<SearchBar value="" onChange={mockOnChange} />);

    const input = screen.getByTestId("search-input");
    fireEvent.change(input, { target: { value: "pizza" } });

    expect(mockOnChange).toHaveBeenCalledWith("pizza");
  });

  it("displays current value", () => {
    render(<SearchBar value="current search" onChange={mockOnChange} />);

    const input = screen.getByTestId("search-input");
    expect(input).toHaveValue("current search");
  });

  it("handles empty string input", () => {
    render(<SearchBar value="something" onChange={mockOnChange} />);

    const input = screen.getByTestId("search-input");
    fireEvent.change(input, { target: { value: "" } });

    expect(mockOnChange).toHaveBeenCalledWith("");
  });

  it("passes additional props correctly", () => {
    render(
      <SearchBar
        value=""
        onChange={mockOnChange}
        disabled={true}
        data-testid="custom-search"
      />
    );

    const input = screen.getByTestId("search-input");
    expect(input).toBeDisabled();
  });
});

describe("Loading Component", () => {
  it("renders loading message", () => {
    render(<Loading message="Loading data..." />);

    expect(screen.getByText("Loading data...")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renders default message when no message provided", () => {
    render(<Loading />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renders loading spinner", () => {
    render(<Loading />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("applies custom styling when provided", () => {
    render(<Loading />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
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

  it("renders without icon when not provided", () => {
    render(<EmptyState message="Empty state" />);

    expect(screen.getByText("Empty state")).toBeInTheDocument();
    expect(screen.queryByTestId("test-icon")).not.toBeInTheDocument();
  });

  it("handles long messages correctly", () => {
    const longMessage =
      "This is a very long message that should be displayed correctly even when it contains multiple words and extends beyond normal length";

    render(<EmptyState message={longMessage} />);

    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });
});
