import { httpClient } from "./client";

export interface Coupon {
  uuid: string;
  coupon_code: string;
  percentage: number;
  restaurant_uuid: string;
  status: string;
  created_at: string;
}

export interface CreateCouponRequest {
  coupon_code: string;
  percentage: number;
}

export interface UpdateCouponRequest {
  percentage: number;
}

export const getRestaurantCoupons = async (
  restaurantUuid: string,
  params?: { page?: number; limit?: number }
): Promise<Coupon[]> => {
  const response = await httpClient.get<Coupon[]>(
    `/restaurants/${restaurantUuid}/coupons`,
    { params }
  );
  return response.data;
};

export const getCoupon = async (uuid: string): Promise<Coupon> => {
  const response = await httpClient.get<Coupon>(`/coupons/${uuid}`);
  return response.data;
};

export const createCoupon = async (
  restaurantUuid: string,
  coupon: CreateCouponRequest
): Promise<Coupon> => {
  const response = await httpClient.post<{ coupon: Coupon }>(
    `/restaurants/${restaurantUuid}/coupons`,
    coupon
  );
  return response.data.coupon;
};

export const updateCoupon = async (
  uuid: string,
  coupon: UpdateCouponRequest
): Promise<Coupon> => {
  const response = await httpClient.patch<Coupon>(`/coupons/${uuid}`, coupon);
  return response.data;
};

export const deleteCoupon = async (uuid: string): Promise<void> => {
  await httpClient.delete(`/coupons/${uuid}`);
};
