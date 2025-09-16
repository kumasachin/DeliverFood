import React from "react";
import { Box, Stepper, Step, StepLabel } from "@mui/material";
import {
  ShoppingCart,
  Kitchen,
  LocalShipping,
  Home,
  CheckCircle,
} from "@mui/icons-material";

interface OrderStatusProps {
  currentStatus: string;
}

const statusSteps = [
  { key: "placed", label: "Order Placed", icon: ShoppingCart },
  { key: "processing", label: "Processing", icon: Kitchen },
  { key: "in route", label: "In Route", icon: LocalShipping },
  { key: "delivered", label: "Delivered", icon: Home },
  { key: "received", label: "Received", icon: CheckCircle },
];

export const OrderStatus = ({ currentStatus }: OrderStatusProps) => {
  const currentStepIndex = statusSteps.findIndex(
    (step) => step.key === currentStatus
  );

  const CustomStepIcon = (props: any) => {
    const { active, completed, icon } = props;
    const step = statusSteps[icon - 1];
    const IconComponent = step.icon;

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 40,
          height: 40,
          borderRadius: "50%",
          backgroundColor: completed || active ? "primary.main" : "grey.300",
          color: completed || active ? "white" : "grey.600",
        }}
      >
        <IconComponent sx={{ fontSize: 20 }} />
      </Box>
    );
  };

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <Stepper activeStep={currentStepIndex} alternativeLabel>
        {statusSteps.map((step, index) => (
          <Step key={step.key} completed={index <= currentStepIndex}>
            <StepLabel StepIconComponent={CustomStepIcon}>
              {step.label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};
