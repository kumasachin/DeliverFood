export interface Meal {
  id: string; // Changed from uuid to id for frontend convenience
  uuid?: string; // Keep uuid for backend compatibility
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  available?: boolean;
  restaurantId: string; // Changed from restaurantUuid to restaurantId
  restaurantUuid?: string; // Keep for backend compatibility
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
