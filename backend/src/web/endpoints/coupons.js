const ModelsRegistry = require("../../model/models");
const validation = require("../util/validation");
const authentication = require("../util/authentication");
const { MODERATORS } = require("../util/constants");
const checkPermissions = require("../util/permissions");
const { couponUpdateSchema } = require("./validationSchemas");

function generateCouponJSON(coupon) {
  return {
    uuid: coupon.uuid,
    coupon_code: coupon.coupon_code,
    percentage: coupon.percentage,
    restaurant_uuid: coupon.restaurant_uuid,
    status: coupon.status,
    created_at: coupon.created_at,
  };
}

/**
 * @param {import('express').Application} app
 * @param {ModelsRegistry} models
 */

function registerCouponsEndpoints(app, models) {
  app.get(
    "/coupons/:uuid",
    authentication(models),
    checkPermissions(MODERATORS, models),
    async (req, res) => {
      const coupon =
        req.userRole === "admin"
          ? await models.coupons().get(req.params.uuid)
          : await models
              .coupons()
              .getWithUuidAndOwnerUuid(req.params.uuid, req.userUuid);

      if (!coupon) {
        if (req.userRole === "owner")
          return res
            .status(404)
            .json({
              error:
                "Your restaurants don't have a coupon with this coupon_uuid",
            });
        else
          return res
            .status(404)
            .json({ error: "Coupon with this coupon_uuid does not exist" });
      }
      return res.json(generateCouponJSON(coupon));
    }
  );

  app.patch(
    "/coupons/:uuid",
    authentication(models),
    validation(couponUpdateSchema),
    checkPermissions(MODERATORS, models),
    async (req, res) => {
      const coupon =
        req.userRole === "admin"
          ? await models.coupons().get(req.params.uuid)
          : await models
              .coupons()
              .getWithUuidAndOwnerUuid(req.params.uuid, req.userUuid);

      if (!coupon) {
        if (req.userRole === "owner")
          return res
            .status(404)
            .json({
              error:
                "Your restaurants don't have a coupon with this coupon_uuid",
            });
        else
          return res
            .status(404)
            .json({ error: "Coupon with this coupon_uuid does not exist" });
      }

      if (coupon.status === "inactive") {
        res.status(404).json({ error: "This coupon is already inactive" });
        return;
      }

      const updateCoupon = await models
        .coupons()
        .update(coupon.uuid, req.validatedBody);
      res.status(200).send(updateCoupon);
    }
  );

  app.delete(
    "/coupons/:uuid",
    authentication(models),
    checkPermissions(MODERATORS, models),
    async (req, res) => {
      const coupon =
        req.userRole === "admin"
          ? await models.coupons().get(req.params.uuid)
          : await models
              .coupons()
              .getWithUuidAndOwnerUuid(req.params.uuid, req.userUuid);

      if (!coupon) {
        if (req.userRole === "owner")
          return res
            .status(404)
            .json({
              error:
                "Your restaurants don't have a coupon with this coupon_uuid",
            });
        else
          return res
            .status(404)
            .json({ error: "Coupon with this coupon_uuid does not exist" });
      }

      if (coupon.status === "inactive") {
        res.status(404).json({ error: "This coupon is already inactive" });
        return;
      }

      await models.coupons().updateStatus(req.params.uuid, "inactive");
      return res.status(204).send();
    }
  );
}

module.exports = {
  generateCouponJSON,
  registerCouponsEndpoints,
};
