import { useMemo } from "react";
import { CartItem } from "../contexts/CartContext";

interface OrderCalculations {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
}

interface UseOrderCalculationsProps {
  items: CartItem[];
  taxRate?: number;
  deliveryFeeAmount?: number;
}

export const useOrderCalculations = ({
  items,
  taxRate = 0.08,
  deliveryFeeAmount = 3.99,
}: UseOrderCalculationsProps): OrderCalculations => {
  return useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.meal.price * item.quantity,
      0
    );
    const deliveryFee = items.length > 0 ? deliveryFeeAmount : 0;
    const tax = subtotal * taxRate;
    const total = subtotal + deliveryFee + tax;

    return {
      subtotal,
      deliveryFee,
      tax,
      total,
    };
  }, [items, taxRate, deliveryFeeAmount]);
};
