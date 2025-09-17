import { useState, useEffect, useCallback } from "react";
import { apiService } from "../services";
import { Meal } from "../services/api";

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
    fetchMeals();
  }, [fetchMeals]);

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
    fetchMeal();
  }, [fetchMeal]);

  return {
    meal,
    loading,
    error,
    refetch: fetchMeal,
  };
};