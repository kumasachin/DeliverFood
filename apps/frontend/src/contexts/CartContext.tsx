import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { Meal } from "../types/meal";

export interface CartItem {
  id: string;
  meal: Meal;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  restaurantId: string | null;
}

export type CartAction =
  | {
      type: "ADD_ITEM";
      payload: { meal: Meal; restaurantId: string; restaurantName: string };
    }
  | { type: "REMOVE_ITEM"; payload: { id: string } }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "CLEAR_RESTAURANT_CONFLICT" };

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  restaurantId: null,
};

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.meal.price * item.quantity, 0);
};

const calculateItemCount = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.quantity, 0);
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const { meal, restaurantId, restaurantName } = action.payload;

      if (state.restaurantId && state.restaurantId !== restaurantId) {
        return state;
      }

      const existingItem = state.items.find((item) => item.meal.id === meal.id);

      let newItems: CartItem[];

      if (existingItem) {
        newItems = state.items.map((item) =>
          item.meal.id === meal.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        const newItem: CartItem = {
          id: `${meal.id}-${Date.now()}`,
          meal,
          quantity: 1,
          restaurantId,
          restaurantName,
        };
        newItems = [...state.items, newItem];
      }

      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems),
        restaurantId: restaurantId,
      };
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter(
        (item) => item.id !== action.payload.id
      );
      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems),
        restaurantId: newItems.length === 0 ? null : state.restaurantId,
      };
    }

    case "UPDATE_QUANTITY": {
      const { id, quantity } = action.payload;

      if (quantity <= 0) {
        const newItems = state.items.filter((item) => item.id !== id);
        return {
          ...state,
          items: newItems,
          total: calculateTotal(newItems),
          itemCount: calculateItemCount(newItems),
          restaurantId: newItems.length === 0 ? null : state.restaurantId,
        };
      }

      const newItems = state.items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );

      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems),
      };
    }

    case "CLEAR_CART": {
      return initialState;
    }

    case "CLEAR_RESTAURANT_CONFLICT": {
      return initialState;
    }

    default:
      return state;
  }
};

interface CartContextType {
  state: CartState;
  addItem: (
    meal: Meal,
    restaurantId: string,
    restaurantName: string
  ) => Promise<boolean>;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  clearRestaurantConflict: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = async (
    meal: Meal,
    restaurantId: string,
    restaurantName: string
  ): Promise<boolean> => {
    if (state.restaurantId && state.restaurantId !== restaurantId) {
      return false;
    }

    dispatch({
      type: "ADD_ITEM",
      payload: { meal, restaurantId, restaurantName },
    });

    return true;
  };

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { id } });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const clearRestaurantConflict = () => {
    dispatch({ type: "CLEAR_RESTAURANT_CONFLICT" });
  };

  const value: CartContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    clearRestaurantConflict,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
