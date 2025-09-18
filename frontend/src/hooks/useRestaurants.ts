import { useState, useEffect, useCallback } from "react";
import { apiService } from "../api";
import { Restaurant } from "../api/restaurants";

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

  const { page, limit, title, description, cuisine, owner_uuid } = options;

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = { page, limit, title, description, cuisine, owner_uuid };
      const data = await apiService.getRestaurants(params);
      setRestaurants(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch restaurants");
    } finally {
      setLoading(false);
    }
  }, [page, limit, title, description, cuisine, owner_uuid]);

  useEffect(() => {
    let isCancelled = false;

    const loadRestaurants = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = { page, limit, title, description, cuisine, owner_uuid };
        const data = await apiService.getRestaurants(params);

        if (!isCancelled) {
          setRestaurants(data);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(
            err.response?.data?.message || "Failed to fetch restaurants"
          );
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadRestaurants();

    return () => {
      isCancelled = true;
    };
  }, [page, limit, title, description, cuisine, owner_uuid]);

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
    if (!uuid) return;

    let isCancelled = false;

    const loadRestaurant = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await apiService.getRestaurant(uuid);

        if (!isCancelled) {
          setRestaurant(data);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err.response?.data?.message || "Failed to fetch restaurant");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadRestaurant();

    return () => {
      isCancelled = true;
    };
  }, [uuid]);

  return {
    restaurant,
    loading,
    error,
    refetch: fetchRestaurant,
  };
};
