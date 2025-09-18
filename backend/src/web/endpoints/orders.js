const validation = require("../util/validation");
const ModelsRegistry = require("../../model/models");
const authentication = require("../util/authentication");
const getPaginationParams = require("../util/getPaginationParams");
const { sendNotFound, sendAccessDenied } = require("../util/commonResponses");
const checkPermissions = require("../util/permissions");

const { ALL_ACCESS, CONTENT, ALLOWED_STATUSES } = require("../util/constants");
const {
  ordresQuerySchema,
  orderCreateSchema,
  orderUpdateSchema,
} = require("./validationSchemas");

function generateOrderJSON(order) {
  return {
    uuid: order.uuid,
    customer_uuid: order.customer_uuid,
    restaurant_uuid: order.restaurant_uuid,
    status: order.status,
    total_price: order.total_price,
    tip_amount: order.tip_amount,
    discount_percentage: order.discount_percentage,
    coupon_code: order.coupon_code,
    created_at: order.created_at,
  };
}

/**
 * @param {import('express').Application} app
 * @param {ModelsRegistry} models
 */

function registerOrdersEndpoints(app, models) {
  app.get(
    "/orders",
    authentication(models),
    validation(ordresQuerySchema),
    checkPermissions(CONTENT, models),
    async (req, res) => {
      const paginationParams = getPaginationParams(req);
      if (!paginationParams.isValid) {
        return res.status(400).json({ error: paginationParams.error });
      }

      let customer_uuid = req.userUuid;

      if (req.userRole === "admin") {
        if (!req.query.customer_uuid) {
          return res
            .status(403)
            .json({ error: "customer_uuid is reqiured for admin users" });
        }

        const customer = await models.users().get(req.query.customer_uuid);
        if (!customer)
          return res.status(404).json({
            error: `customer with customer_uuid ${req.query.customer_uuid} not found`,
          });
        if (customer.status !== "active")
          return res.status(400).json({
            error: `customer with customer_uuid ${req.query.customer_uuid} is not active`,
          });

        customer_uuid = req.query.customer_uuid;
      }

      const orders = await models.orders().list({
        pageIndex: paginationParams.pageNo,
        limit: paginationParams.limit,
        customerUuid: customer_uuid,
      });

      const renderedOrders = [];
      for (const order of orders) {
        renderedOrders.push(generateOrderJSON(order));
      }

      return res.json(renderedOrders);
    }
  );

  app.get(
    "/orders/:uuid",
    authentication(models),
    checkPermissions(ALL_ACCESS, models),
    async (req, res) => {
      const order = await models.orders().get(req.params.uuid);
      if (!order) {
        sendNotFound(res);
        return;
      }

      const isOwner = await models
        .users()
        .isRestaurantOwner(req.params.uuid, req.userUuid);
      if (
        !isOwner &&
        req.userUuid !== order.customer_uuid &&
        req.userRole !== "admin"
      ) {
        sendAccessDenied(res);
        return;
      }

      return res.status(200).json(order);
    }
  );

  app.post(
    "/orders",
    authentication(models),
    validation(orderCreateSchema),
    checkPermissions(CONTENT, models),
    async (req, res) => {
      let customer_uuid = req.userUuid;

      if (req.userRole === "admin") {
        if (!req.validatedBody.customer_uuid) {
          return res
            .status(400)
            .json({ error: "customer_uuid is required for admin users" });
        }

        const customer = await models
          .users()
          .get(req.validatedBody.customer_uuid);
        if (!customer)
          return res.status(404).json({
            error: `Customer with customer_uuid ${req.validatedBody.customer_uuid} not found`,
          });
        if (customer.role !== "customer")
          return res.status(404).json({
            error: `Creating orders is not allowed for non-customers`,
          });
        if (customer.status !== "active")
          return res.status(400).json({
            error: `Customer with customer_uuid ${req.validatedBody.customer_uuid} is not active`,
          });

        customer_uuid = req.validatedBody.customer_uuid;
      }

      const orderItems = req.validatedBody.order_items;
      let firstItemRestaurantUuid = undefined;
      let allItemsSameRestaurant = true;
      for (const item of orderItems) {
        let restaurant_uuid = await models
          .meals()
          .getMealRestaurantUuid(item.meal_uuid);
        if (!restaurant_uuid) {
          return res
            .status(404)
            .json({ error: `Meal with meal_uuid ${item.meal_uuid} not found` });
        }
        if (firstItemRestaurantUuid === undefined) {
          firstItemRestaurantUuid = restaurant_uuid;
        }
        if (restaurant_uuid !== firstItemRestaurantUuid) {
          allItemsSameRestaurant = false;
        }
      }
      if (!allItemsSameRestaurant) {
        res.status(400).json({
          error: "All the order_items should be from the same restaurant.",
        });
        return;
      }

      const couponCode = req.validatedBody.coupon_code;
      let discount_percentage = 0;
      if (couponCode) {
        const coupon = await models
          .coupons()
          .getWithCodeAndRestaurantUUID(couponCode, firstItemRestaurantUuid);
        if (!coupon || coupon.status !== "active") {
          return res.status(400).json({ error: "Wrong coupon code" });
        }
        const couponPercentage = await models
          .coupons()
          .getCouponPercentage(couponCode, firstItemRestaurantUuid);
        if (couponPercentage === null) {
          return res
            .status(500)
            .json({ error: "Failed to retrieve coupon percentage." });
        }
        discount_percentage = couponPercentage;
      }

      const order = await models.orders().create({
        ...req.validatedBody,
        discount_percentage: discount_percentage,
        restaurant_uuid: firstItemRestaurantUuid,
        customer_uuid: customer_uuid,
      });

      res.status(201).json({
        order,
      });
    }
  );

  app.get(
    "/orders/:uuid/history",
    authentication(models),
    checkPermissions(ALL_ACCESS, models),
    async (req, res) => {
      const order = await models.orders().get(req.params.uuid);
      if (!order) {
        sendNotFound(res);
        return;
      }

      const isOwner = await models
        .users()
        .isRestaurantOwner(req.params.uuid, req.userUuid);
      if (
        !isOwner &&
        req.userUuid !== order.customer_uuid &&
        req.userRole !== "admin"
      ) {
        sendAccessDenied(res);
        return;
      }

      const history = await models.orders().getOrderHistory(req.params.uuid);
      res.status(200).json(history);
    }
  );

  app.get(
    "/orders/:uuid/status",
    authentication(models),
    checkPermissions(ALL_ACCESS, models),
    async (req, res) => {
      const order = await models.orders().get(req.params.uuid);
      if (!order) {
        sendNotFound(res);
        return;
      }

      const isOwner = await models
        .users()
        .isRestaurantOwner(req.params.uuid, req.userUuid);
      if (
        !isOwner &&
        req.userUuid !== order.customer_uuid &&
        req.userRole !== "admin"
      ) {
        sendAccessDenied(res);
        return;
      }

      const status = await models.orders().getStatus(req.params.uuid);
      res.status(200).json(status);
    }
  );

  app.patch(
    "/orders/:uuid",
    authentication(models),
    validation(orderUpdateSchema),
    checkPermissions(ALL_ACCESS, models),
    async (req, res) => {
      let order = await models.orders().get(req.params.uuid);
      if (!order) {
        sendNotFound(res);
        return;
      }
      const isOwner = await models
        .users()
        .isRestaurantOwner(req.params.uuid, req.userUuid);
      if (
        !isOwner &&
        req.userUuid !== order.customer_uuid &&
        req.userRole !== "admin"
      ) {
        sendAccessDenied(res);
        return;
      }

      if (order.status === "cancelled") {
        res.status(400).json({ error: "Order is already cancelled" });
        return;
      }

      if (!ALLOWED_STATUSES[req.userRole].includes(req.validatedBody.status)) {
        return res.status(400).json({ error: `Not allowed status` });
      }

      const updateOrder = await models
        .orders()
        .updateStatus(order.uuid, req.validatedBody.status);
      res.status(200).send(updateOrder);
    }
  );
}

module.exports = {
  generateOrderJSON,
  registerOrdersEndpoints,
};
