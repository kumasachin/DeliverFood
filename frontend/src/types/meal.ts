export interface Meal {
  id: string;
  uuid?: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  available?: boolean;
  restaurantId: string;
  restaurantUuid?: string;
}

export interface MealForm {
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  available?: boolean;
}

export interface MealList {
  meals: Meal[];
  total: number;
  page: number;
  limit: number;
}
