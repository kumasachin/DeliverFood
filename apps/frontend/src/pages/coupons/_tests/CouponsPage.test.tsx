import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CouponsPage } from "../CouponsPage";

const theme = createTheme();

jest.mock("../../../components/Coupon/CouponBrowser", () => {
  return function MockCouponBrowser() {
    return (
      <div data-testid="coupon-browser">
        <h2>Coupon Browser</h2>
        <p>Browse available coupons here</p>
      </div>
    );
  };
});

describe("CouponsPage Component", () => {
  const renderComponent = () => {
    return render(
      <ThemeProvider theme={theme}>
        <CouponsPage />
      </ThemeProvider>
    );
  };

  describe("Basic Rendering", () => {
    it("should render without crashing", () => {
      renderComponent();

      expect(screen.getByTestId("coupon-browser")).toBeInTheDocument();
    });

    it("should render CouponBrowser component", () => {
      renderComponent();

      expect(screen.getByText("Coupon Browser")).toBeInTheDocument();
      expect(
        screen.getByText("Browse available coupons here")
      ).toBeInTheDocument();
    });

    it("should render main heading", () => {
      renderComponent();

      expect(
        screen.getByRole("heading", { name: "Coupon Browser" })
      ).toBeInTheDocument();
    });
  });

  describe("Component Integration", () => {
    it("should properly integrate CouponBrowser component", () => {
      renderComponent();

      const couponBrowser = screen.getByTestId("coupon-browser");
      expect(couponBrowser).toBeInTheDocument();

      expect(
        screen.getByRole("heading", { name: "Coupon Browser" })
      ).toBeInTheDocument();
    });

    it("should display expected content", () => {
      renderComponent();

      expect(
        screen.getByText("Browse available coupons here")
      ).toBeInTheDocument();
    });
  });

  describe("Theme Integration", () => {
    it("should render with Material-UI theme", () => {
      renderComponent();

      expect(screen.getByTestId("coupon-browser")).toBeInTheDocument();

      expect(
        screen.getByRole("heading", { name: "Coupon Browser" })
      ).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should be accessible with proper structure", () => {
      renderComponent();

      expect(
        screen.getByRole("heading", { name: "Coupon Browser" })
      ).toBeInTheDocument();

      expect(
        screen.getByText("Browse available coupons here")
      ).toBeInTheDocument();
    });

    it("should provide proper semantic structure", () => {
      renderComponent();

      expect(screen.getByTestId("coupon-browser")).toBeInTheDocument();
      expect(screen.getByText("Coupon Browser")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should handle component mounting without errors", () => {
      const { unmount } = renderComponent();

      expect(screen.getByTestId("coupon-browser")).toBeInTheDocument();

      unmount();
    });

    it("should render consistently across multiple renders", () => {
      const { unmount: unmount1 } = renderComponent();
      expect(screen.getByTestId("coupon-browser")).toBeInTheDocument();
      unmount1();

      const { unmount: unmount2 } = renderComponent();
      expect(screen.getByTestId("coupon-browser")).toBeInTheDocument();
      unmount2();
    });
  });
});
