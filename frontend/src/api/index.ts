import * as auth from "./auth";
import * as restaurants from "./restaurants";
import * as meals from "./meals";
import * as orders from "./orders";
import * as coupons from "./coupons";
import * as users from "./users";

export * from "./auth";
export * from "./restaurants";
export * from "./meals";
export * from "./orders";
export * from "./coupons";
export * from "./users";
export { httpClient } from "./client";

export const apiService = {
  ...auth,
  ...restaurants,
  ...meals,
  ...orders,
  ...coupons,
  ...users,
};

export default apiService;
