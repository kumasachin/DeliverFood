import { httpClient } from "./client";
import { Meal } from "../types/meal";

export const getRestaurantMeals = async (
  restaurantUuid: string,
  params?: { page?: number; limit?: number }
): Promise<Meal[]> => {
  const response = await httpClient.get<any[]>(
    `/restaurants/${restaurantUuid}/meals`,
    { params }
  );

  return response.data.map((mealData: any) => ({
    id: mealData.uuid,
    uuid: mealData.uuid,
    name: mealData.title,
    description: mealData.description,
    price: mealData.price,
    category: mealData.section,
    restaurantId: mealData.restaurant_uuid,
    restaurantUuid: mealData.restaurant_uuid,
    available: true,
  }));
};

export const getMeal = async (uuid: string): Promise<Meal> => {
  const response = await httpClient.get<any>(`/meals/${uuid}`);
  const mealData = response.data;

  return {
    id: mealData.uuid,
    uuid: mealData.uuid,
    name: mealData.title,
    description: mealData.description,
    price: mealData.price,
    category: mealData.section,
    restaurantId: mealData.restaurant_uuid,
    restaurantUuid: mealData.restaurant_uuid,
    available: true,
  };
};

export const createMeal = async (
  restaurantUuid: string,
  meal: Omit<Meal, "id" | "uuid" | "restaurantId" | "restaurantUuid">
): Promise<Meal> => {
  const backendMealData = {
    title: meal.name,
    description: meal.description || "",
    price: meal.price,
    section: meal.category || "Main",
    restaurant_uuid: restaurantUuid,
  };

  const response = await httpClient.post<{ meal: any }>(
    `/restaurants/${restaurantUuid}/meals`,
    backendMealData
  );

  const createdMeal = response.data.meal;
  return {
    id: createdMeal.uuid,
    uuid: createdMeal.uuid,
    name: createdMeal.title,
    description: createdMeal.description,
    price: createdMeal.price,
    category: createdMeal.section,
    restaurantId: createdMeal.restaurant_uuid,
    restaurantUuid: createdMeal.restaurant_uuid,
    available: true,
  };
};

export const updateMeal = async (
  uuid: string,
  meal: Partial<Meal>
): Promise<Meal> => {
  const backendUpdateData: any = {};
  if (meal.name) backendUpdateData.title = meal.name;
  if (meal.description !== undefined)
    backendUpdateData.description = meal.description;
  if (meal.price !== undefined) backendUpdateData.price = meal.price;
  if (meal.category) backendUpdateData.section = meal.category;

  const response = await httpClient.put<any>(
    `/meals/${uuid}`,
    backendUpdateData
  );
  const updatedMeal = response.data;

  return {
    id: updatedMeal.uuid,
    uuid: updatedMeal.uuid,
    name: updatedMeal.title,
    description: updatedMeal.description,
    price: updatedMeal.price,
    category: updatedMeal.section,
    restaurantId: updatedMeal.restaurant_uuid,
    restaurantUuid: updatedMeal.restaurant_uuid,
    available: true,
  };
};

export const deleteMeal = async (uuid: string): Promise<void> => {
  await httpClient.delete(`/meals/${uuid}`);
};
