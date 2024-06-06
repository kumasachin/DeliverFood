const ModelsRegistry = require("../../model/models");
const authentication = require("../util/authentication");
const checkPermissions = require("../util/permissions");
const { MODERATORS } = require("../util/constants");
const { sendNotFound } = require("../util/commonResponses");

/**
 * @param {import('express').Application} app
 * @param {ModelsRegistry} models
 */
function registerUserEndpoints(app, models) {
  app.post(
    "/block/:uuid",
    authentication(models),
    checkPermissions(MODERATORS, models),
    async (req, res) => {
      const userToBeBlocked = await models.users().get(req.params.uuid);
      if (!userToBeBlocked) {
        sendNotFound(res);
        return;
      }

      if (userToBeBlocked.uuid === req.userUuid) {
        return res.status(403).json({ error: "You can't block yourself" });
      }

      if (userToBeBlocked.role === "admin") {
        return res
          .status(403)
          .json({ error: "Admin user cannot be blocked by owner" });
      }

      if (req.userRole === "owner" && userToBeBlocked.role === "owner") {
        return res
          .status(403)
          .json({ error: "Onwers can block only customers" });
      }

      if (userToBeBlocked.status === "blocked") {
        return res.status(403).json({ error: "It's already blocked" });
      }

      await models.users().updateStatus(userToBeBlocked.uuid, "blocked");
      res.status(204).end();
    }
  );
}

module.exports = registerUserEndpoints;
