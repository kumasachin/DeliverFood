import React from "react";
import { Container } from "@mui/material";
import CouponBrowser from "../../components/Coupon/CouponBrowser";

export const CouponsPage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <CouponBrowser />
    </Container>
  );
};
