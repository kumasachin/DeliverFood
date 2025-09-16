export interface Restaurant {
  id: string;
  uuid?: string;
  name: string;
  description?: string;
  cuisine?: string;
  category?: string;
  address?: string;
  phone?: string;
  email?: string;
  image?: string;
  rating?: number;
  deliveryTime?: string;
  ownerUuid?: string;
}

export interface RestaurantForm {
  name: string;
  description?: string;
  cuisine?: string;
  address?: string;
  phone?: string;
  email?: string;
  image?: string;
}

export interface RestaurantList {
  restaurants: Restaurant[];
  total: number;
  page: number;
  limit: number;
}
