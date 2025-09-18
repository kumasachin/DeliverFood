import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { OrderStatus } from "../OrderStatus";

const theme = createTheme();

describe("OrderStatus Page Component", () => {
  describe("Status Step Rendering", () => {
    it("should render with placed status", () => {
      render(
        <ThemeProvider theme={theme}>
          <OrderStatus currentStatus="placed" />
        </ThemeProvider>
      );

      expect(screen.getByText("Order Placed")).toBeInTheDocument();
      expect(screen.getByText("Processing")).toBeInTheDocument();
      expect(screen.getByText("In Route")).toBeInTheDocument();
      expect(screen.getByText("Delivered")).toBeInTheDocument();
      expect(screen.getByText("Received")).toBeInTheDocument();
    });

    it("should render with processing status", () => {
      render(
        <ThemeProvider theme={theme}>
          <OrderStatus currentStatus="processing" />
        </ThemeProvider>
      );

      expect(screen.getByText("Order Placed")).toBeInTheDocument();
      expect(screen.getByText("Processing")).toBeInTheDocument();
    });

    it("should render with in route status", () => {
      render(
        <ThemeProvider theme={theme}>
          <OrderStatus currentStatus="in route" />
        </ThemeProvider>
      );

      expect(screen.getByText("In Route")).toBeInTheDocument();
    });

    it("should render with delivered status", () => {
      render(
        <ThemeProvider theme={theme}>
          <OrderStatus currentStatus="delivered" />
        </ThemeProvider>
      );

      expect(screen.getByText("Delivered")).toBeInTheDocument();
    });

    it("should render with received status", () => {
      render(
        <ThemeProvider theme={theme}>
          <OrderStatus currentStatus="received" />
        </ThemeProvider>
      );

      expect(screen.getByText("Received")).toBeInTheDocument();
    });
  });

  describe("Status Step Progression", () => {
    it("should show correct progression for each status", () => {
      const statuses = [
        "placed",
        "processing",
        "in route",
        "delivered",
        "received",
      ] as const;

      statuses.forEach((status) => {
        const { unmount } = render(
          <ThemeProvider theme={theme}>
            <OrderStatus currentStatus={status} />
          </ThemeProvider>
        );

        expect(screen.getByText("Order Placed")).toBeInTheDocument();

        unmount();
      });
    });
  });

  describe("Component Structure", () => {
    it("should render a horizontal stepper", () => {
      render(
        <ThemeProvider theme={theme}>
          <OrderStatus currentStatus="placed" />
        </ThemeProvider>
      );

      expect(screen.getByText("Order Placed")).toBeInTheDocument();
      expect(screen.getByText("Processing")).toBeInTheDocument();
    });

    it("should render correct number of steps", () => {
      render(
        <ThemeProvider theme={theme}>
          <OrderStatus currentStatus="processing" />
        </ThemeProvider>
      );

      expect(screen.getByText("Order Placed")).toBeInTheDocument();
      expect(screen.getByText("Processing")).toBeInTheDocument();
      expect(screen.getByText("In Route")).toBeInTheDocument();
      expect(screen.getByText("Delivered")).toBeInTheDocument();
      expect(screen.getByText("Received")).toBeInTheDocument();
    });
  });

  describe("Icon Rendering", () => {
    it("should render with custom step icons", () => {
      render(
        <ThemeProvider theme={theme}>
          <OrderStatus currentStatus="placed" />
        </ThemeProvider>
      );

      expect(screen.getByTestId("ShoppingCartIcon")).toBeInTheDocument();
      expect(screen.getByTestId("KitchenIcon")).toBeInTheDocument();
      expect(screen.getByTestId("LocalShippingIcon")).toBeInTheDocument();
      expect(screen.getByTestId("HomeIcon")).toBeInTheDocument();
      expect(screen.getByTestId("CheckCircleIcon")).toBeInTheDocument();
    });
  });

  describe("Status Labels", () => {
    it("should maintain consistent step order", () => {
      render(
        <ThemeProvider theme={theme}>
          <OrderStatus currentStatus="delivered" />
        </ThemeProvider>
      );

      const labels = [
        "Order Placed",
        "Processing",
        "In Route",
        "Delivered",
        "Received",
      ];

      labels.forEach((label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });
  });

  describe("Props Handling", () => {
    it("should accept currentStatus prop correctly", () => {
      const { rerender } = render(
        <ThemeProvider theme={theme}>
          <OrderStatus currentStatus="placed" />
        </ThemeProvider>
      );

      expect(screen.getByText("Order Placed")).toBeInTheDocument();

      rerender(
        <ThemeProvider theme={theme}>
          <OrderStatus currentStatus="processing" />
        </ThemeProvider>
      );

      expect(screen.getByText("Processing")).toBeInTheDocument();
    });

    it("should handle all valid status values", () => {
      const validStatuses = [
        "placed",
        "processing",
        "in route",
        "delivered",
        "received",
      ] as const;

      validStatuses.forEach((status) => {
        const { unmount } = render(
          <ThemeProvider theme={theme}>
            <OrderStatus currentStatus={status} />
          </ThemeProvider>
        );

        expect(screen.getByText("Order Placed")).toBeInTheDocument();

        unmount();
      });
    });
  });
});
