const express = require("express");
const ModelsRegistry = require("../model/models");
const cors = require("./cors");
const path = require("path");
const swagger = require("./swagger");
const registerAuthenticationEndpoints = require("./endpoints/authentication");
const registerRestaurantsEndpoints = require("./endpoints/restaurants");
const registerUserEndpoints = require("./endpoints/user");
const { registerMealsEndpoints } = require("./endpoints/meals");
const { registerOrdersEndpoints } = require("./endpoints/orders");
const { registerCouponsEndpoints } = require("./endpoints/coupons");

/**
 * @param {ModelsRegistry} models
 */
module.exports = function (models) {
  const app = express();
  app.use(express.json());
  app.use(cors);
  swagger(app, "/api-docs");

  registerAuthenticationEndpoints(app, models);
  registerRestaurantsEndpoints(app, models);
  registerUserEndpoints(app, models);
  registerMealsEndpoints(app, models);
  registerOrdersEndpoints(app, models);
  registerCouponsEndpoints(app, models);

  app.get("/", (_req, res) => {
    res.sendFile(path.join(__dirname, "root.html"));
  });

  return app;
};
