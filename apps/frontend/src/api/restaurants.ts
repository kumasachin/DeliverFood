import { httpClient } from "./client";

export interface Restaurant {
  uuid: string;
  title: string;
  description: string;
  cuisine: string;
  owner_uuid: string;
  created_at: string;
  coordinates: {
    lat: string;
    lng: string;
  };
}

export const getRestaurants = async (params?: {
  page?: number;
  limit?: number;
  title?: string;
  description?: string;
  cuisine?: string;
  owner_uuid?: string;
}): Promise<Restaurant[]> => {
  const response = await httpClient.get<Restaurant[]>("/restaurants", {
    params,
  });
  return response.data;
};

export const getRestaurant = async (uuid: string): Promise<Restaurant> => {
  const response = await httpClient.get<Restaurant>(`/restaurants/${uuid}`);
  return response.data;
};

export const createRestaurant = async (
  restaurant: Omit<Restaurant, "uuid" | "created_at" | "owner_uuid">
): Promise<Restaurant> => {
  const response = await httpClient.post<Restaurant>(
    "/restaurants",
    restaurant
  );
  return response.data;
};

export const updateRestaurant = async (
  uuid: string,
  restaurant: Partial<Restaurant>
): Promise<Restaurant> => {
  const response = await httpClient.put<Restaurant>(
    `/restaurants/${uuid}`,
    restaurant
  );
  return response.data;
};

export const deleteRestaurant = async (uuid: string): Promise<void> => {
  await httpClient.delete(`/restaurants/${uuid}`);
};
