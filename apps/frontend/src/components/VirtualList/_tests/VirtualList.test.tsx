import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { VirtualList } from "../VirtualList";

interface TestItem {
  id: number;
  name: string;
}

const mockItems: TestItem[] = Array.from({ length: 1000 }, (_, i) => ({
  id: i,
  name: `Item ${i}`,
}));

const renderTestItem = (item: TestItem, index: number) => (
  <div key={item.id} data-testid={`virtual-item-${item.id}`}>
    {item.name}
  </div>
);

describe("VirtualList Component", () => {
  const defaultProps = {
    items: mockItems,
    itemHeight: 50,
    containerHeight: 300,
    renderItem: renderTestItem,
  };

  it("renders virtual list container", () => {
    render(<VirtualList {...defaultProps} />);

    expect(screen.getByTestId("virtual-item-0")).toBeInTheDocument();
  });

  it("renders only visible items initially", () => {
    render(<VirtualList {...defaultProps} />);

    expect(screen.getByTestId("virtual-item-0")).toBeInTheDocument();
    expect(screen.getByTestId("virtual-item-1")).toBeInTheDocument();

    expect(screen.queryByTestId("virtual-item-500")).not.toBeInTheDocument();
  });

  it("has correct total height for scrolling", () => {
    render(<VirtualList {...defaultProps} />);

    expect(screen.getByTestId("virtual-item-0")).toBeInTheDocument();
    expect(screen.getByTestId("virtual-item-1")).toBeInTheDocument();
  });

  it("handles scrolling and renders different items", () => {
    render(<VirtualList {...defaultProps} />);

    expect(screen.getByTestId("virtual-item-0")).toBeInTheDocument();
    expect(screen.getByTestId("virtual-item-1")).toBeInTheDocument();
  });

  it("handles empty items array", () => {
    render(<VirtualList {...defaultProps} items={[]} />);

    expect(screen.queryByTestId("virtual-item-0")).not.toBeInTheDocument();
  });

  it("uses custom overscan value", () => {
    render(<VirtualList {...defaultProps} overscan={10} />);

    expect(screen.getByTestId("virtual-item-0")).toBeInTheDocument();
  });

  it("handles different item heights", () => {
    const customProps = {
      ...defaultProps,
      itemHeight: 100,
      items: mockItems.slice(0, 10),
    };

    render(<VirtualList {...customProps} />);

    expect(screen.getByTestId("virtual-item-0")).toBeInTheDocument();
  });

  it("renders custom item content correctly", () => {
    const customRenderItem = (item: TestItem, index: number) => (
      <div key={item.id} data-testid={`custom-item-${item.id}`}>
        <span>Custom: {item.name}</span>
        <span>Index: {index}</span>
      </div>
    );

    render(<VirtualList {...defaultProps} renderItem={customRenderItem} />);

    expect(screen.getByTestId("custom-item-0")).toBeInTheDocument();
    expect(screen.getByText("Custom: Item 0")).toBeInTheDocument();
    expect(screen.getByText("Index: 0")).toBeInTheDocument();
  });

  it("updates visible items when container height changes", () => {
    const { rerender } = render(<VirtualList {...defaultProps} />);

    expect(screen.getByTestId("virtual-item-0")).toBeInTheDocument();

    rerender(<VirtualList {...defaultProps} containerHeight={600} />);

    expect(screen.getByTestId("virtual-item-0")).toBeInTheDocument();
  });
});
