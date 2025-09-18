import { useState, useEffect, useCallback } from "react";
import { apiService } from "../api";
import { Meal } from "../types/meal";

export interface UseMealsOptions {
  restaurantUuid?: string;
  page?: number;
  limit?: number;
}

export interface UseMealsResult {
  meals: Meal[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useMeals = (options: UseMealsOptions): UseMealsResult => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMeals = useCallback(async () => {
    if (!options.restaurantUuid) return;

    setLoading(true);
    setError(null);

    try {
      const data = await apiService.getRestaurantMeals(options.restaurantUuid, {
        page: options.page,
        limit: options.limit,
      });
      setMeals(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch meals");
    } finally {
      setLoading(false);
    }
  }, [options.restaurantUuid, options.page, options.limit]);

  useEffect(() => {
    if (!options.restaurantUuid) return;

    let isCancelled = false;

    const loadMeals = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await apiService.getRestaurantMeals(
          options.restaurantUuid!,
          { page: options.page, limit: options.limit }
        );

        if (!isCancelled) {
          setMeals(data);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err.response?.data?.message || "Failed to fetch meals");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadMeals();

    return () => {
      isCancelled = true;
    };
  }, [options.restaurantUuid, options.page, options.limit]);

  return {
    meals,
    loading,
    error,
    refetch: fetchMeals,
  };
};

export interface UseMealResult {
  meal: Meal | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useMeal = (uuid: string): UseMealResult => {
  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMeal = useCallback(async () => {
    if (!uuid) return;

    setLoading(true);
    setError(null);

    try {
      const data = await apiService.getMeal(uuid);
      setMeal(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch meal");
    } finally {
      setLoading(false);
    }
  }, [uuid]);

  useEffect(() => {
    if (!uuid) return;

    let isCancelled = false;

    const loadMeal = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await apiService.getMeal(uuid);

        if (!isCancelled) {
          setMeal(data);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err.response?.data?.message || "Failed to fetch meal");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadMeal();

    return () => {
      isCancelled = true;
    };
  }, [uuid]);

  return {
    meal,
    loading,
    error,
    refetch: fetchMeal,
  };
};
