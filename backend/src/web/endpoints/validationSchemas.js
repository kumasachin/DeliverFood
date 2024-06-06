const Joi = require("joi");
const { SECTIONS, ORDER_STATUSES, CUISINES } = require("../util/constants");

const registrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(50).required(),
  role: Joi.string().valid("customer", "owner").required(),
});

const authenticationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().max(50).required(),
});

const mealUpdateSchema = Joi.object({
  title: Joi.string().min(1).max(30),
  description: Joi.string().min(1).max(80),
  price: Joi.number().min(1),
  section: Joi.string()
    .valid(...SECTIONS)
    .required(),
});

const ordresQuerySchema = Joi.object({
  customer_uuid: Joi.string().guid(),
});

const orderCreateSchema = Joi.object({
  tip_amount: Joi.number().min(1),
  coupon_code: Joi.string().max(10),
  order_items: Joi.array().items({
    meal_uuid: Joi.string().guid(),
    quantity: Joi.number().min(1),
  }),
  customer_uuid: Joi.string().guid(),
});

const orderUpdateSchema = Joi.object({
  status: Joi.string()
    .valid(...ORDER_STATUSES)
    .required(),
});

const coordinatesSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
});

const restaurantsQuerySchema = Joi.object({
  title: Joi.string().min(1).max(30),
  description: Joi.string().min(1).max(80),
  cuisine: Joi.string().valid(...CUISINES),
  owner_uuid: Joi.string().guid(),
});

const restaurantCreateSchema = Joi.object({
  title: Joi.string().required().min(1).max(30),
  description: Joi.string().required().min(1).max(80),
  cuisine: Joi.string()
    .required()
    .valid(...CUISINES),
  coordinates: coordinatesSchema,
  owner_uuid: Joi.string().guid(),
});

const restaurantUpdateSchema = Joi.object({
  title: Joi.string().min(1).max(30),
  description: Joi.string().min(1).max(80),
  cuisine: Joi.string().valid(...CUISINES),
  coordinates: coordinatesSchema,
});

const restaurantsOrdresSchema = Joi.object({
  title: Joi.string().min(1).max(30),
  description: Joi.string().min(1).max(80),
  cuisine: Joi.string().valid(...CUISINES),
  owner_uuid: Joi.string().guid(),
});

const mealsQuerySchema = Joi.object({
  restaurant_uuid: Joi.string().guid(),
});

const mealCreateSchema = Joi.object({
  title: Joi.string().required().min(1).max(30),
  description: Joi.string().required().min(1).max(80),
  price: Joi.number().required().min(1),
  section: Joi.string()
    .valid(...SECTIONS)
    .required(),
  restaurant_uuid: Joi.string().required(),
});

const couponsQuerySchema = Joi.object({
  restaurant_uuid: Joi.string().guid(),
});

const couponCreateSchema = Joi.object({
  coupon_code: Joi.string().required().min(1).max(30),
  percentage: Joi.number().required().min(1).max(100),
  restaurant_uuid: Joi.string().required(),
});

const couponUpdateSchema = Joi.object({
  percentage: Joi.number().required().min(1).max(100).required(),
});

module.exports = {
  registrationSchema,
  authenticationSchema,

  mealCreateSchema,
  mealsQuerySchema,
  mealUpdateSchema,

  orderCreateSchema,
  ordresQuerySchema,
  orderUpdateSchema,

  coordinatesSchema,

  restaurantCreateSchema,
  restaurantsQuerySchema,
  restaurantUpdateSchema,
  restaurantsOrdresSchema,

  couponsQuerySchema,
  couponCreateSchema,
  couponUpdateSchema,
};
