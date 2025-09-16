// API Configuration
const API_BASE_URL = "http://localhost:3000";

// API utility functions
class API {
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem("authToken");

    const config = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Authentication
  static async login(email, password) {
    const response = await this.request("/tokens", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // Since the backend doesn't return user info with login, we'll need to extract it from the token
    // For now, we'll make a simple assumption based on email patterns
    // In a real app, you'd decode the JWT or make a separate API call to get user info
    let role = "customer"; // default
    if (email.includes("owner") || email.includes("restaurant")) {
      role = "owner";
    } else if (email.includes("admin")) {
      role = "admin";
    }

    return { ...response, user: { email, role } };
  }

  static async register(email, password, role) {
    return this.request("/registrations", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    });
  }

  static async blockUser(uuid) {
    return this.request(`/block/${uuid}`, {
      method: "POST",
    });
  }

  // Restaurants
  static async getRestaurants(page = 0, limit = 20) {
    return this.request(`/restaurants?page=${page}&limit=${limit}`);
  }

  static async getRestaurant(uuid) {
    return this.request(`/restaurants/${uuid}`);
  }

  static async createRestaurant(restaurant) {
    return this.request("/restaurants", {
      method: "POST",
      body: JSON.stringify(restaurant),
    });
  }

  static async updateRestaurant(uuid, restaurant) {
    return this.request(`/restaurants/${uuid}`, {
      method: "PUT",
      body: JSON.stringify(restaurant),
    });
  }

  static async deleteRestaurant(uuid) {
    return this.request(`/restaurants/${uuid}`, {
      method: "DELETE",
    });
  }

  // Meals
  static async getRestaurantMeals(restaurantUuid, page = 0, limit = 20) {
    return this.request(
      `/restaurants/${restaurantUuid}/meals?page=${page}&limit=${limit}`
    );
  }

  static async getMeal(uuid) {
    return this.request(`/meals/${uuid}`);
  }

  static async createMeal(restaurantUuid, meal) {
    return this.request(`/restaurants/${restaurantUuid}/meals`, {
      method: "POST",
      body: JSON.stringify(meal),
    });
  }

  static async updateMeal(uuid, meal) {
    return this.request(`/meals/${uuid}`, {
      method: "PUT",
      body: JSON.stringify(meal),
    });
  }

  static async deleteMeal(uuid) {
    return this.request(`/meals/${uuid}`, {
      method: "DELETE",
    });
  }

  // Orders
  static async getOrders(page = 0, limit = 20) {
    return this.request(`/orders?page=${page}&limit=${limit}`);
  }

  static async getRestaurantOrders(restaurantUuid, page = 0, limit = 20) {
    return this.request(
      `/restaurants/${restaurantUuid}/orders?page=${page}&limit=${limit}`
    );
  }

  static async getOrder(uuid) {
    return this.request(`/orders/${uuid}`);
  }

  static async createOrder(order) {
    return this.request("/orders", {
      method: "POST",
      body: JSON.stringify(order),
    });
  }

  static async updateOrderStatus(uuid, status) {
    return this.request(`/orders/${uuid}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  static async getOrderStatus(uuid) {
    return this.request(`/orders/${uuid}/status`);
  }

  static async getOrderHistory(uuid) {
    return this.request(`/orders/${uuid}/history`);
  }

  // Coupons
  static async getRestaurantCoupons(restaurantUuid, page = 0, limit = 20) {
    return this.request(
      `/restaurants/${restaurantUuid}/coupons?page=${page}&limit=${limit}`
    );
  }

  static async createCoupon(restaurantUuid, coupon) {
    return this.request(`/restaurants/${restaurantUuid}/coupons`, {
      method: "POST",
      body: JSON.stringify(coupon),
    });
  }

  static async updateCoupon(uuid, coupon) {
    return this.request(`/coupons/${uuid}`, {
      method: "PUT",
      body: JSON.stringify(coupon),
    });
  }

  static async deleteCoupon(uuid) {
    return this.request(`/coupons/${uuid}`, {
      method: "DELETE",
    });
  }
}

// Authentication utility functions
class Auth {
  static login(token, user) {
    localStorage.setItem("authToken", token);
    localStorage.setItem("currentUser", JSON.stringify(user));
  }

  static logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    window.location.href = "/ui/pages/sign-in/sign-in.html";
  }

  static getCurrentUser() {
    const userJson = localStorage.getItem("currentUser");
    return userJson ? JSON.parse(userJson) : null;
  }

  static getToken() {
    return localStorage.getItem("authToken");
  }

  static isAuthenticated() {
    return !!this.getToken();
  }

  static requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = "/ui/pages/sign-in/sign-in.html";
      return false;
    }
    return true;
  }

  static hasRole(role) {
    const user = this.getCurrentUser();
    return user && user.role === role;
  }
}

// Cart utility functions
class Cart {
  static getCart() {
    const cartJson = localStorage.getItem("cart");
    return cartJson
      ? JSON.parse(cartJson)
      : { items: [], restaurantUuid: null };
  }

  static addItem(meal, restaurantUuid, quantity = 1) {
    const cart = this.getCart();

    // If cart has items from different restaurant, clear it
    if (cart.restaurantUuid && cart.restaurantUuid !== restaurantUuid) {
      if (
        !confirm(
          "Adding items from a different restaurant will clear your current cart. Continue?"
        )
      ) {
        return false;
      }
      cart.items = [];
    }

    cart.restaurantUuid = restaurantUuid;

    const existingItem = cart.items.find((item) => item.uuid === meal.uuid);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        uuid: meal.uuid,
        name: meal.name,
        price: meal.price,
        quantity: quantity,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    return true;
  }

  static removeItem(mealUuid) {
    const cart = this.getCart();
    cart.items = cart.items.filter((item) => item.uuid !== mealUuid);
    if (cart.items.length === 0) {
      cart.restaurantUuid = null;
    }
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static updateQuantity(mealUuid, quantity) {
    const cart = this.getCart();
    const item = cart.items.find((item) => item.uuid === mealUuid);
    if (item) {
      if (quantity <= 0) {
        this.removeItem(mealUuid);
      } else {
        item.quantity = quantity;
        localStorage.setItem("cart", JSON.stringify(cart));
      }
    }
  }

  static clear() {
    localStorage.removeItem("cart");
  }

  static getTotal() {
    const cart = this.getCart();
    return cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }

  static getItemCount() {
    const cart = this.getCart();
    return cart.items.reduce((count, item) => count + item.quantity, 0);
  }
}

// Utility functions
class Utils {
  static formatCurrency(amount) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100); // Assuming API returns cents
  }

  static formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  static showError(message) {
    // Simple error display - could be enhanced with a proper toast/modal system
    alert(`Error: ${message}`);
  }

  static showSuccess(message) {
    // Simple success display - could be enhanced with a proper toast/modal system
    alert(`Success: ${message}`);
  }
}

// Order status constants and utilities
const ORDER_STATUS = {
  PLACED: "placed",
  PROCESSING: "processing",
  IN_ROUTE: "in route",
  DELIVERED: "delivered",
  RECEIVED: "received",
  CANCELLED: "cancelled",
};

const STATUS_FLOW = {
  [ORDER_STATUS.PLACED]: [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.IN_ROUTE, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.IN_ROUTE]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.DELIVERED]: [ORDER_STATUS.RECEIVED],
  [ORDER_STATUS.RECEIVED]: [],
  [ORDER_STATUS.CANCELLED]: [],
};

class OrderUtils {
  static getAvailableStatusChanges(currentStatus) {
    return STATUS_FLOW[currentStatus] || [];
  }

  static canUserChangeStatus(currentStatus, newStatus, userRole) {
    const availableStatuses = this.getAvailableStatusChanges(currentStatus);
    if (!availableStatuses.includes(newStatus)) {
      return false;
    }

    // Status change permissions
    switch (newStatus) {
      case ORDER_STATUS.PROCESSING:
      case ORDER_STATUS.IN_ROUTE:
      case ORDER_STATUS.DELIVERED:
        return userRole === "owner" || userRole === "admin";
      case ORDER_STATUS.RECEIVED:
        return userRole === "customer" || userRole === "admin";
      case ORDER_STATUS.CANCELLED:
        return true; // Any role can cancel (with appropriate permissions)
      default:
        return false;
    }
  }

  static getStatusDisplayName(status) {
    switch (status) {
      case ORDER_STATUS.PLACED:
        return "Placed";
      case ORDER_STATUS.PROCESSING:
        return "Processing";
      case ORDER_STATUS.IN_ROUTE:
        return "In Route";
      case ORDER_STATUS.DELIVERED:
        return "Delivered";
      case ORDER_STATUS.RECEIVED:
        return "Received";
      case ORDER_STATUS.CANCELLED:
        return "Cancelled";
      default:
        return status;
    }
  }

  static getStatusColor(status) {
    switch (status) {
      case ORDER_STATUS.PLACED:
        return "#2196F3";
      case ORDER_STATUS.PROCESSING:
        return "#FF9800";
      case ORDER_STATUS.IN_ROUTE:
        return "#9C27B0";
      case ORDER_STATUS.DELIVERED:
        return "#4CAF50";
      case ORDER_STATUS.RECEIVED:
        return "#8BC34A";
      case ORDER_STATUS.CANCELLED:
        return "#F44336";
      default:
        return "#757575";
    }
  }
}
