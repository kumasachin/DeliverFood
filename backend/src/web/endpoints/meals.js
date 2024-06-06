const validation = require("../util/validation");
const ModelsRegistry = require("../../model/models");
const authentication = require("../util/authentication");
const { sendNotFound } = require("../util/commonResponses");

const { ALL_ACCESS, MODERATORS } = require("../util/constants");
const checkPermissions = require("../util/permissions");
const { mealUpdateSchema } = require("./validationSchemas");

function generateMealJSON(meal) {
  return {
    uuid: meal.uuid,
    title: meal.title,
    description: meal.description,
    price: meal.price,
    section: meal.section,
    created_at: meal.created_at,
    restaurant_uuid: meal.restaurant_uuid,
  };
}
/**
 * @param {import('express').Application} app
 * @param {ModelsRegistry} models
 */

function registerMealsEndpoints(app, models) {
  app.get(
    "/meals/:uuid",
    authentication(models),
    checkPermissions(ALL_ACCESS, models),
    async (req, res) => {
      const meal = await models.meals().get(req.params.uuid);
      if (meal) {
        res.json(generateMealJSON(meal));
      } else {
        sendNotFound(res);
      }
    }
  );

  app.patch(
    "/meals/:uuid",
    authentication(models),
    validation(mealUpdateSchema),
    checkPermissions(MODERATORS, models),
    async (req, res) => {
      const meal =
        req.userRole === "admin"
          ? await models.meals().get(req.params.uuid)
          : await models
              .meals()
              .getWithUuidAndOwnerUuid(req.params.uuid, req.userUuid);

      if (!meal) {
        res
          .status(404)
          .json({
            error: "Your restaurants don't have meals with this meal_uuid",
          });
        return;
      }

      let restaurant = await models.restaurants().get(meal.restaurant_uuid);
      if (!restaurant) {
        res
          .status(404)
          .json({ error: "The restaurant of this meal not found" });
        return;
      }

      const updateMeal = await models
        .meals()
        .update(meal.uuid, req.validatedBody);
      res.status(200).send(updateMeal);
    }
  );

  app.delete(
    "/meals/:uuid",
    authentication(models),
    checkPermissions(MODERATORS, models),
    async (req, res) => {
      const meal =
        req.userRole === "admin"
          ? await models.meals().get(req.params.uuid)
          : await models
              .meals()
              .getWithUuidAndOwnerUuid(req.params.uuid, req.userUuid);

      if (!meal) {
        res
          .status(404)
          .json({
            error: "Your restaurants don't have meals with this meal_uuid",
          });
        return;
      }

      let restaurant = await models.restaurants().get(meal.restaurant_uuid);
      if (!restaurant) {
        res
          .status(404)
          .json({ error: "The restaurant of this meal not found" });
        return;
      }

      if (meal.status === "deleted") {
        res.status(404).json({ error: "This meal is already deleted" });
        return;
      }

      await models.meals().updateStatus(req.params.uuid, "deleted");
      res.status(204).send();
    }
  );
}

module.exports = {
  generateMealJSON,
  registerMealsEndpoints,
};
