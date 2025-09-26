const express = require("express");
const cors = require("cors");

function createServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Example health endpoint
  app.get("/health", (req, res) => {
    res.json({ status: "ok", message: "Backend is running!" });
  });

  // Auth endpoints
  app.post("/tokens", (req, res) => {
    const { email, password } = req.body;
    // Mock login - in real app, validate credentials
    if (email && password) {
      res.json({
        token: "mock-jwt-token-" + Date.now(),
        role: email.includes("owner") ? "owner" : "customer",
      });
    } else {
      res.status(400).json({ error: "Invalid credentials" });
    }
  });

  app.post("/registrations", (req, res) => {
    const { email, password, role } = req.body;
    // Mock registration - in real app, create user
    if (email && password && role) {
      res.json({
        uuid: "user-" + Date.now(),
        email,
        role,
        created_at: new Date().toISOString(),
        token: "mock-jwt-token-" + Date.now(),
      });
    } else {
      res.status(400).json({ error: "Missing required fields" });
    }
  });

  // Restaurants endpoint
  app.get("/restaurants", (req, res) => {
    // Mock restaurant data
    const mockRestaurants = [
      {
        uuid: "rest-1",
        title: "Pizza Palace",
        description: "Best pizza in town",
        cuisine: "Italian",
        owner_uuid: "owner-1",
        created_at: new Date().toISOString(),
        coordinates: { lat: "40.7128", lng: "-74.0060" },
      },
      {
        uuid: "rest-2",
        title: "Burger Joint",
        description: "Gourmet burgers",
        cuisine: "American",
        owner_uuid: "owner-2",
        created_at: new Date().toISOString(),
        coordinates: { lat: "40.7589", lng: "-73.9851" },
      },
    ];
    res.json(mockRestaurants);
  });

  // Meals endpoint
  app.get("/meals", (req, res) => {
    const mockMeals = [
      {
        uuid: "meal-1",
        title: "Margherita Pizza",
        description: "Classic cheese pizza",
        price: 12.99,
        restaurant_uuid: "rest-1",
        created_at: new Date().toISOString(),
      },
      {
        uuid: "meal-2",
        title: "Cheeseburger",
        description: "Juicy beef burger with cheese",
        price: 9.99,
        restaurant_uuid: "rest-2",
        created_at: new Date().toISOString(),
      },
    ];
    res.json(mockMeals);
  });

  // Orders endpoint
  app.get("/orders", (req, res) => {
    const mockOrders = [
      {
        uuid: "order-1",
        user_uuid: "user-1",
        restaurant_uuid: "rest-1",
        status: "pending",
        total: 25.98,
        created_at: new Date().toISOString(),
      },
    ];
    res.json(mockOrders);
  });

  // Coupons endpoint
  app.get("/coupons", (req, res) => {
    const mockCoupons = [
      {
        uuid: "coupon-1",
        code: "SAVE10",
        discount: 10,
        restaurant_uuid: "rest-1",
        created_at: new Date().toISOString(),
      },
    ];
    res.json(mockCoupons);
  });

  // Users endpoint
  app.get("/users", (req, res) => {
    const mockUsers = [
      {
        uuid: "user-1",
        email: "customer@example.com",
        role: "customer",
        created_at: new Date().toISOString(),
      },
    ];
    res.json(mockUsers);
  });

  return app;
}

module.exports = createServer;
