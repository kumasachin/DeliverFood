export interface CartItem {
  uuid: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  restaurantUuid: string | null;
}

export interface Coupon {
  uuid: string;
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  expiresAt?: string;
  restaurantUuid: string;
  active: boolean;
}

export interface CouponForm {
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  expiresAt?: string;
}

export interface CouponList {
  coupons: Coupon[];
  total: number;
  page: number;
  limit: number;
}
