export interface MealForm {
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  available?: boolean;
}

export interface MealList {
  meals: MealForm[];
  total: number;
  page: number;
  limit: number;
}
