const validation = require("../util/validation");
const ModelsRegistry = require("../../model/models");
const {
  registrationSchema,
  authenticationSchema,
} = require("./validationSchemas");

function generateRegistrationJSON(user, token) {
  return {
    uuid: user.uuid,
    email: user.email,
    role: user.role,
    created_at: user.created_at.toISOString(),
    token: token,
  };
}

/**
 * @param {import('express').Application} app
 * @param {ModelsRegistry} models
 */
function registerAuthenticationEndpoints(app, models) {
  app.post(
    "/registrations",
    validation(registrationSchema),
    async (req, res) => {
      const payload = { ...req.validatedBody, created_at: new Date() };
      payload.password_hash = await models
        .users()
        .hashPassword(payload.password);
      delete payload.password;

      try {
        const user = await models.users().register(payload);
        const token = models
          .authTokens()
          .generate({ userUuid: user.uuid, userRole: user.role });

        res.status(201).json(generateRegistrationJSON(user, token));
      } catch (e) {
        if (e.code === models.users().UniquenessErrorCode) {
          res.status(409).json({ error: "Email already exists" });
          return;
        } else {
          throw e;
        }
      }
    }
  );

  app.post("/tokens", validation(authenticationSchema), async (req, res) => {
    const password = req.validatedBody.password;
    const userInfo = await models.users().getByEmail(req.validatedBody.email);
    if (!userInfo) {
      res.status(400).json({ error: "Invalid credentials" });
      return;
    }

    if (userInfo.status !== "active") {
      res.status(400).json({ error: "Blocked user" });
      return;
    }

    const isPasswordCorrect = await models
      .users()
      .comparePasswords({ plain: password, hash: userInfo.password_hash });
    if (isPasswordCorrect) {
      res.status(201).json({
        token: models
          .authTokens()
          .generate({ userUuid: userInfo.uuid, userRole: userInfo.role }),
        role: userInfo.role,
      });
    } else {
      res.status(400).json({ error: "Invalid credentials" });
    }
  });
}

module.exports = registerAuthenticationEndpoints;
