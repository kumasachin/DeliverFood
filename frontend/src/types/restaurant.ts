export interface Restaurant {
  uuid: string;
  name: string;
  description?: string;
  cuisine?: string;
  address?: string;
  phone?: string;
  email?: string;
  image?: string;
  rating?: number;
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
