const request = require("supertest");
const { createDb } = require("../../model/db/db");
const { dbReset } = require("../../model/db/dbReset");
const ModelsRegistry = require("../../model/models");
const createServer = require("../createServer");

module.exports = async function buildTestEnvironment() {
  let db = createDb();
  db = await dbReset();
  const models = new ModelsRegistry(db, "jwtSecret");
  const server = createServer(models);

  let authenticatedAgent;

  return {
    db,
    models,
    server,
    buildAuthenticatedAgent: async function () {
      if (!authenticatedAgent) {
        const authenticatedUser = await models.users().register({
          email: "myauthenticatedagentuser@example.com",
          password_hash: await models
            .users()
            .hashPassword("longerAndMoreComplex."),
          created_at: new Date(),
        });
        const authToken = models
          .authTokens()
          .generate({ userUuid: authenticatedUser.uuid, issuedAt: Date.now() });
        authenticatedAgent = request.agent(server).set({
          Authorization: `Bearer ${authToken}`,
        });
        authenticatedAgent.userUuid = authenticatedUser.uuid;
      }

      return authenticatedAgent;
    },
    buildUnauthenticatedAgent: async function () {
      return request.agent(server);
    },
  };
};
