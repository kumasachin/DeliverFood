export interface MealForm {
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  available?: boolean;
}

export interface MealList {
  meals: {
    uuid: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
    category?: string;
    available?: boolean;
    restaurantUuid: string;
  }[];
  total: number;
  page: number;
  limit: number;
}
