const ModelsRegistry = require("../../model/models");
const authentication = require("../util/authentication");
const checkPermissions = require("../util/permissions");
const { MODERATORS } = require("../util/constants");
const { sendNotFound } = require("../util/commonResponses");

function generateUserJSON(user) {
  return {
    uuid: user.uuid,
    email: user.email,
    role: user.role,
    status: user.status,
    created_at: user.created_at.toISOString(),
  };
}

/**
 * @param {import('express').Application} app
 * @param {ModelsRegistry} models
 */
function registerUserEndpoints(app, models) {
  // Get user by email (for blocking purposes)
  app.get(
    "/users/search",
    authentication(models),
    checkPermissions(MODERATORS, models),
    async (req, res) => {
      const { email } = req.query;

      if (!email) {
        return res.status(400).json({ error: "Email parameter is required" });
      }

      try {
        const user = await models.users().getByEmail(email);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        // Get full user details for management
        const fullUser = await models.users().get(user.uuid);
        if (!fullUser) {
          return res.status(404).json({ error: "User not found" });
        }

        res.json(generateUserJSON(fullUser));
      } catch (error) {
        res.status(500).json({ error: "Failed to search user" });
      }
    }
  );

  // Get blocked users
  app.get(
    "/blocked-users",
    authentication(models),
    checkPermissions(MODERATORS, models),
    async (req, res) => {
      try {
        const blockedUsers = await models.users().getByStatus("blocked");
        const renderedUsers = blockedUsers.map((user) =>
          generateUserJSON(user)
        );
        res.json(renderedUsers);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch blocked users" });
      }
    }
  );

  // Block user - ADMIN ONLY (global blocking)
  app.post(
    "/block/:uuid",
    authentication(models),
    checkPermissions(["admin"], models), // Only admins can do global blocking
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
        return res.status(403).json({ error: "Admin user cannot be blocked" });
      }

      if (userToBeBlocked.status === "blocked") {
        return res.status(403).json({ error: "User is already blocked" });
      }

      await models.users().updateStatus(userToBeBlocked.uuid, "blocked");
      res.status(204).end();
    }
  );

  // Unblock user - ADMIN ONLY (global unblocking)
  app.post(
    "/unblock/:uuid",
    authentication(models),
    checkPermissions(["admin"], models), // Only admins can do global unblocking
    async (req, res) => {
      const userToBeUnblocked = await models.users().get(req.params.uuid);
      if (!userToBeUnblocked) {
        sendNotFound(res);
        return;
      }

      if (userToBeUnblocked.status !== "blocked") {
        return res.status(403).json({ error: "User is not blocked" });
      }

      await models.users().updateStatus(userToBeUnblocked.uuid, "active");
      res.status(204).end();
    }
  );
}

module.exports = registerUserEndpoints;
