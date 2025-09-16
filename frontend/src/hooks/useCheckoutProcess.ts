import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useLocalStorage } from "./useLocalStorage";

interface Order {
  id: string;
  items: any[];
  total: number;
  address: string;
  phone: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  restaurantId?: string | null;
}

export const useCheckoutProcess = () => {
  const navigate = useNavigate();
  const { state: cartState, clearCart } = useCart();
  const [, setOrders] = useLocalStorage<Order[]>("orders", []);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const placeOrder = async (orderDetails: {
    address: string;
    phone: string;
    paymentMethod: string;
    total: number;
  }) => {
    if (!orderDetails.address.trim()) {
      setError("Please enter a delivery address");
      return false;
    }

    if (!orderDetails.phone.trim()) {
      setError("Please enter a phone number");
      return false;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const order: Order = {
        id: Date.now().toString(),
        items: cartState.items,
        total: orderDetails.total,
        address: orderDetails.address,
        phone: orderDetails.phone,
        paymentMethod: orderDetails.paymentMethod,
        status: "placed",
        createdAt: new Date().toISOString(),
        restaurantId: cartState.restaurantId,
      };

      setOrders((prevOrders) => [...prevOrders, order]);
      clearCart();
      navigate(`/orders/${order.id}`);
      return true;
    } catch (err) {
      setError("Failed to place order. Please try again.");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    placeOrder,
    isProcessing,
    error,
    setError,
  };
};
