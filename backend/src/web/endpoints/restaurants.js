const validation = require("../util/validation");
const ModelsRegistry = require("../../model/models");
const authentication = require("../util/authentication");
const getPaginationParams = require("../util/getPaginationParams");
const { sendNotFound } = require("../util/commonResponses");
const { generateOrderJSON } = require("../endpoints/orders");
const { generateMealJSON } = require("../endpoints/meals");
const { generateCouponJSON } = require("../endpoints/coupons");
const checkPermissions = require("../util/permissions");
const { ALL_ACCESS, MODERATORS } = require("../util/constants");

const {
  restaurantsQuerySchema,
  restaurantCreateSchema,
  restaurantUpdateSchema,
  restaurantsOrdresSchema,
  mealsQuerySchema,
  mealCreateSchema,
  couponsQuerySchema,
  couponCreateSchema,
} = require("./validationSchemas");

function generateRestaurantJSON(restaurant) {
  return {
    uuid: restaurant.uuid,
    title: restaurant.title,
    description: restaurant.description,
    cuisine: restaurant.cuisine,
    owner_uuid: restaurant.owner_uuid,
    created_at: restaurant.created_at.toISOString(),
    coordinates: {
      lat: restaurant.coordinates.lat,
      lng: restaurant.coordinates.lng,
    },
  };
}

/**
 * @param {import('express').Application} app
 * @param {ModelsRegistry} models
 */
function registerRestaurantsEndpoints(app, models) {
  app.get(
    "/restaurants",
    authentication(models),
    validation(restaurantsQuerySchema),
    checkPermissions(ALL_ACCESS, models),
    async (req, res) => {
      const paginationParams = getPaginationParams(req);
      if (!paginationParams.isValid) {
        res.status(400).json({ error: paginationParams.error });
        return;
      }

      let queryOptions = {
        pageIndex: paginationParams.pageNo,
        limit: paginationParams.limit,
        title: req.query.title || null,
        description: req.query.description || null,
        cuisine: req.query.cuisine || null,
        status: "active",
      };

      req.userRole === "owner"
        ? (queryOptions.owner_uuid = req.userUuid)
        : (queryOptions.owner_uuid = req.query.owner_uuid || null);

      const restaurants = await models.restaurants().list(queryOptions);

      const renderedRestaurants = [];
      for (const restaurant of restaurants) {
        renderedRestaurants.push(generateRestaurantJSON(restaurant));
      }

      res.json(renderedRestaurants);
    }
  );

  app.get(
    "/restaurants/:uuid",
    authentication(models),
    checkPermissions(ALL_ACCESS, models),
    async (req, res) => {
      const restaurant = await models.restaurants().get(req.params.uuid);
      if (restaurant) {
        res.json(generateRestaurantJSON(restaurant));
      } else {
        sendNotFound(res);
      }
    }
  );

  app.post(
    "/restaurants",
    authentication(models),
    validation(restaurantCreateSchema),
    checkPermissions(MODERATORS, models),
    async (req, res) => {
      let owner_uuid = req.userUuid;

      if (req.userRole === "admin") {
        if (!req.validatedBody.owner_uuid) {
          return res
            .status(400)
            .json({ error: "owner_uuid is required for admin users" });
        }

        const owner = await models.users().get(req.validatedBody.owner_uuid);
        if (!owner)
          return res.status(404).json({
            error: `Owner with owner_uuid ${req.validatedBody.owner_uuid} not found`,
          });
        if (owner.role !== "owner")
          return res.status(404).json({
            error: `Creating restaurants is not allowed for non-owners`,
          });
        if (owner.status !== "active")
          return res.status(400).json({
            error: `Owner with owner_uuid ${req.validatedBody.owner_uuid} is not active`,
          });

        owner_uuid = req.validatedBody.owner_uuid;
      }

      const restaurant = await models.restaurants().create({
        ...req.validatedBody,
        owner_uuid: owner_uuid,
        created_at: new Date(),
        status: "active",
        status_changed_at: new Date(),
      });

      res.status(201).json(generateRestaurantJSON(restaurant));
    }
  );

  app.patch(
    "/restaurants/:uuid",
    authentication(models),
    validation(restaurantUpdateSchema),
    checkPermissions(MODERATORS, models),
    async (req, res) => {
      const restaurant =
        req.userRole === "admin"
          ? await models.restaurants().get(req.params.uuid)
          : await models
              .restaurants()
              .getWithUuidAndOwnerUuid(req.params.uuid, req.userUuid);

      if (!restaurant) {
        const errorMessage =
          req.userRole === "owner"
            ? "You don't own a restaurant with this restaurant_uuid"
            : "Restaurant with this restaurant_uuid does not exist";

        res.status(404).json({ error: errorMessage });
        return;
      }

      const updatedRestaurant = await models
        .restaurants()
        .update(restaurant.uuid, req.validatedBody);
      res.status(200).send(generateRestaurantJSON(updatedRestaurant));
    }
  );

  app.delete(
    "/restaurants/:uuid",
    authentication(models),
    checkPermissions(MODERATORS, models),
    async (req, res) => {
      const restaurant =
        req.userRole === "admin"
          ? await models.restaurants().get(req.params.uuid)
          : await models
              .restaurants()
              .getWithUuidAndOwnerUuid(req.params.uuid, req.userUuid);

      if (!restaurant) {
        if (req.userRole === "owner") {
          res.status(404).json({
            error: "You don't own a restaurant with this restaurant_uuid",
          });
        } else {
          res.status(404).json({
            error: "Restaurant with this restaurant_uuid does not exist",
          });
        }
        return;
      }

      await models.restaurants().updateStatus(req.params.uuid, "deleted");
      res.status(204).send();
    }
  );

  app.get(
    "/restaurants/:uuid/meals",
    authentication(models),
    validation(mealsQuerySchema),
    checkPermissions(ALL_ACCESS, models),
    async (req, res) => {
      const paginationParams = getPaginationParams(req);
      if (!paginationParams.isValid) {
        return res.status(400).json({ error: paginationParams.error });
      }

      const restaurant = await models.restaurants().get(req.params.uuid);
      if (!restaurant) {
        return res.status(404).json({
          error: "Restaurant with this restaurant_uuid does not exist",
        });
      }

      const meals = await models.meals().list({
        pageIndex: paginationParams.pageNo,
        limit: paginationParams.limit,
        restaurant_uuid: req.params.uuid,
      });

      const renderedMeals = [];
      for (const meal of meals) {
        renderedMeals.push(generateMealJSON(meal));
      }

      res.json(renderedMeals);
    }
  );

  app.post(
    "/restaurants/:uuid/meals",
    authentication(models),
    validation(mealCreateSchema),
    checkPermissions(MODERATORS, models),
    async (req, res) => {
      const restaurant =
        req.userRole === "owner"
          ? await models
              .restaurants()
              .getWithUuidAndOwnerUuid(
                req.validatedBody.restaurant_uuid,
                req.userUuid
              )
          : await models.restaurants().get(req.validatedBody.restaurant_uuid);

      if (!restaurant) {
        const errorMessage =
          req.userRole === "owner"
            ? "You don't own a restaurant with this restaurant_uuid"
            : "Restaurant with this restaurant_uuid does not exist";

        return res.status(404).json({ error: errorMessage });
      }

      const meal = await models.meals().create({
        ...req.validatedBody,
        created_at: new Date(),
        status: "active",
        status_changed_at: new Date(),
      });

      res.status(201).json({ meal });
    }
  );

  app.get(
    "/restaurants/:uuid/orders",
    authentication(models),
    validation(restaurantsOrdresSchema),
    checkPermissions(ALL_ACCESS, models),
    async (req, res) => {
      const paginationParams = getPaginationParams(req);
      if (!paginationParams.isValid) {
        return res.status(400).json({ error: paginationParams.error });
      }

      const restaurant =
        req.userRole === "owner"
          ? await models
              .restaurants()
              .getWithUuidAndOwnerUuid(req.params.uuid, req.userUuid)
          : await models.restaurants().get(req.params.uuid);

      if (!restaurant) {
        const errorMessage =
          req.userRole === "owner"
            ? "You don't own a restaurant with this restaurant_uuid"
            : "Restaurant with this restaurant_uuid does not exist";

        return res.status(404).json({ error: errorMessage });
      }

      const listOrderParams = {
        pageIndex: paginationParams.pageNo,
        limit: paginationParams.limit,
        restaurantUuid: restaurant.uuid,
        customerUuid: req.userRole === "customer" ? req.userUuid : undefined,
      };

      const orders = await models.restaurants().listOrders(listOrderParams);

      const renderedOrders = [];
      for (const order of orders) {
        renderedOrders.push(generateOrderJSON(order));
      }

      res.json(renderedOrders);
    }
  );

  app.get(
    "/restaurants/:uuid/coupons",
    authentication(models),
    validation(couponsQuerySchema),
    checkPermissions(MODERATORS, models),
    async (req, res) => {
      const paginationParams = getPaginationParams(req);
      if (!paginationParams.isValid) {
        return res.status(400).json({ error: paginationParams.error });
      }

      const restaurant =
        req.userRole === "owner"
          ? await models
              .restaurants()
              .getWithUuidAndOwnerUuid(req.params.uuid, req.userUuid)
          : await models.restaurants().get(req.params.uuid);
      if (!restaurant) {
        const errorMessage =
          req.userRole === "owner"
            ? "You don't own a restaurant with this restaurant_uuid"
            : "Restaurant with this restaurant_uuid does not exist";

        return res.status(404).json({ error: errorMessage });
      }

      const listCouponParams = {
        pageIndex: paginationParams.pageNo,
        limit: paginationParams.limit,
        restaurant_uuid: restaurant.uuid,
      };

      const orders = await models.coupons().list(listCouponParams);

      const renderedOrders = [];
      for (const order of orders) {
        renderedOrders.push(generateCouponJSON(order));
      }

      res.json(renderedOrders);
    }
  );

  app.post(
    "/restaurants/:uuid/coupons",
    authentication(models),
    validation(couponCreateSchema),
    checkPermissions(MODERATORS, models),
    async (req, res) => {
      const restaurant =
        req.userRole === "admin"
          ? await models.restaurants().get(req.validatedBody.restaurant_uuid)
          : await models
              .restaurants()
              .getWithUuidAndOwnerUuid(
                req.validatedBody.restaurant_uuid,
                req.userUuid
              );

      if (!restaurant) {
        if (req.userRole === "owner") {
          res.status(404).json({
            error: "You don't own a restaurant with this restaurant_uuid",
          });
        } else {
          res.status(404).json({
            error: "Restaurant with this restaurant_uuid does not exist",
          });
        }
        return;
      }

      let coupon = await models
        .coupons()
        .getWithCodeAndRestaurantUUID(
          req.validatedBody.coupon_code,
          req.validatedBody.restaurant_uuid
        );
      if (coupon) {
        if (coupon.status === "active") {
          return res.status(400).json({
            error: "Coupon already exists and is active. You can edit it.",
            coupon: coupon,
          });
        } else {
          const newData = {
            percentage: req.validatedBody.percentage,
            status: "active",
          };
          const updatedCoupon = await models
            .coupons()
            .update(coupon.uuid, newData);
          return res.status(200).json({
            message:
              "Coupon already exists and was inactive. and it's updated successfully",
            coupon: updatedCoupon,
          });
        }
      } else {
        coupon = await models.coupons().create({
          ...req.validatedBody,
          created_at: new Date(),
          status: "active",
          status_changed_at: new Date(),
        });

        return res.status(201).json({ coupon });
      }
    }
  );
}

module.exports = registerRestaurantsEndpoints;
