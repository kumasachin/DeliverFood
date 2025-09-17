import React from "react";
import {
  Restaurant,
  Storefront,
  Login,
  PersonAdd,
  ShoppingCart,
  Logout,
  Receipt,
  Add,
  Remove,
  Delete,
  ShoppingCartOutlined,
  Payment,
  LocalShipping,
  ShoppingBag,
  Visibility,
  ArrowBack,
  Kitchen,
  Home,
  CheckCircle,
  Search,
} from "@mui/icons-material";
import { SvgIconProps } from "@mui/material";

export type DLSIconName =
  | "restaurant"
  | "storefront"
  | "login"
  | "personAdd"
  | "shoppingCart"
  | "logout"
  | "receipt"
  | "add"
  | "remove"
  | "delete"
  | "shoppingCartOutlined"
  | "payment"
  | "localShipping"
  | "shoppingBag"
  | "visibility"
  | "arrowBack"
  | "kitchen"
  | "home"
  | "checkCircle"
  | "search";

export interface DLSIconProps extends SvgIconProps {
  name: DLSIconName;
  size?: "small" | "medium" | "large";
}

const iconMap = {
  restaurant: Restaurant,
  storefront: Storefront,
  login: Login,
  personAdd: PersonAdd,
  shoppingCart: ShoppingCart,
  logout: Logout,
  receipt: Receipt,
  add: Add,
  remove: Remove,
  delete: Delete,
  shoppingCartOutlined: ShoppingCartOutlined,
  payment: Payment,
  localShipping: LocalShipping,
  shoppingBag: ShoppingBag,
  visibility: Visibility,
  arrowBack: ArrowBack,
  kitchen: Kitchen,
  home: Home,
  checkCircle: CheckCircle,
  search: Search,
};

export const DLSIcon: React.FC<DLSIconProps> = ({
  name,
  size = "medium",
  ...props
}) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in DLS icon library`);
    return null;
  }

  const fontSize =
    size === "small" ? "small" : size === "large" ? "large" : "medium";

  return <IconComponent fontSize={fontSize} {...props} />;
};
