const db = require("./db/db");
const User = require("./user");
const AuthToken = require("./authToken");
const Restaurant = require("./restaurant");
const Meal = require("./meal");
const Order = require("./order");
const OrderItem = require("./orderItems");
const Coupon = require("./coupon");

class ModelsRegistry {
  constructor(db, jwtSecret) {
    this.db = db;
    this._jwtSecret = jwtSecret;
    this._models = {};
  }

  /**
   * @returns {User}
   */
  users() {
    if (!this._models.user) {
      this._models.user = new User(this.db);
    }
    return this._models.user;
  }

  /**
   * @returns {AuthToken}
   */
  authTokens() {
    if (!this._models.authToken) {
      this._models.authToken = new AuthToken(this._jwtSecret);
    }
    return this._models.authToken;
  }

  /**
   * @returns {Restaurant}
   */
  restaurants() {
    if (!this._models.restaurants) {
      this._models.restaurants = new Restaurant(this.db);
    }
    return this._models.restaurants;
  }

  /**
   * @returns {Meal}
   */
  meals() {
    if (!this._models.meals) {
      this._models.meals = new Meal(this.db);
    }
    return this._models.meals;
  }

  /**
   * @returns {Order}
   */
  orders() {
    if (!this._models.orders) {
      this._models.orders = new Order(this.db);
    }
    return this._models.orders;
  }

  /**
   * @returns {OrderItem}
   */
  orderItems() {
    if (!this._models.orderItems) {
      this._models.orderItems = new OrderItem(this.db);
    }
    return this._models.orderItems;
  }

  /**
   * @returns {Coupon}
   */
  coupons() {
    if (!this._models.coupons) {
      this._models.coupons = new Coupon(this.db);
    }
    return this._models.coupons;
  }

  allModels() {
    return [
      this.users(),
      this.authTokens(),
      this.restaurants(),
      this.meals(),
      this.orders(),
      this.orderItems(),
      this.coupons(),
    ];
  }
}

module.exports = ModelsRegistry;
