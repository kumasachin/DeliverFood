import { useState, useEffect, useCallback } from "react";
import { apiService } from "../services";
import { Restaurant } from "../services/api";

export interface UseRestaurantsOptions {
  page?: number;
  limit?: number;
  title?: string;
  description?: string;
  cuisine?: string;
  owner_uuid?: string;
}

export interface UseRestaurantsResult {
  restaurants: Restaurant[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useRestaurants = (
  options: UseRestaurantsOptions = {}
): UseRestaurantsResult => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiService.getRestaurants(options);
      setRestaurants(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch restaurants");
    } finally {
      setLoading(false);
    }
  }, [options]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  return {
    restaurants,
    loading,
    error,
    refetch: fetchRestaurants,
  };
};

export interface UseRestaurantResult {
  restaurant: Restaurant | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useRestaurant = (uuid: string): UseRestaurantResult => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurant = useCallback(async () => {
    if (!uuid) return;

    setLoading(true);
    setError(null);

    try {
      const data = await apiService.getRestaurant(uuid);
      setRestaurant(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch restaurant");
    } finally {
      setLoading(false);
    }
  }, [uuid]);

  useEffect(() => {
    fetchRestaurant();
  }, [fetchRestaurant]);

  return {
    restaurant,
    loading,
    error,
    refetch: fetchRestaurant,
  };
};
