const ModelsRegistry = require("./../../model/models");
const buildTestEnvironment = require("./../testutil/buildTestEnvironment");

let authenticatedAgent;
let unauthenticatedAgent;
/** @type {ModelsRegistry} */
let models;
beforeEach(async () => {
  const testEnv = await buildTestEnvironment();
  authenticatedAgent = await testEnv.buildAuthenticatedAgent();
  models = testEnv.models;
  unauthenticatedAgent = await testEnv.buildUnauthenticatedAgent();
});

describe("Registration API", () => {
  describe("registration", () => {
    it("registers user", async () => {
      const response = await unauthenticatedAgent.post("/registrations").send({
        email: "myemail@example.com",
        password: "longerAndMoreComplex.",
      });
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        uuid: expect.any(String),
        email: "myemail@example.com",
        created_at: expect.any(String),
        token: expect.any(String),
      });
    });

    it("enforces runtime validations", async () => {
      const response = await unauthenticatedAgent.post("/registrations").send({
        email: "myemail@example.com",
        password: "short",
      });
      expect(response.status).toBe(400);
    });

    it("enforces email uniqueness", async () => {
      await models.users().register({
        email: "myemail@example.com",
        created_at: new Date(),
        password_hash: await models.users().hashPassword("testing"),
      });
      const response = await unauthenticatedAgent.post("/registrations").send({
        email: "myemail@example.com",
        password: "myLongPassword",
      });
      expect(response.status).toBe(409);
    });
  });
});

const userPlainPassword = "longerAndMoreComplex.";
async function createUser() {
  return await models.users().register({
    email: "myemail@example.com",
    password_hash: await models.users().hashPassword(userPlainPassword),
    created_at: new Date(),
  });
}

describe("Authentication API", () => {
  test("authentication", async () => {
    const unauthenticatedResponse = await unauthenticatedAgent.get(
      "/restaurants"
    );
    expect(unauthenticatedResponse.status).toBe(401);

    const authenticatedResponse = await authenticatedAgent.get("/restaurants");
    expect(authenticatedResponse.status).toBe(200);
  });

  test("obtaining token", async () => {
    const user = await createUser();

    const invalidPasswordResponse = await unauthenticatedAgent
      .post("/tokens")
      .send({
        email: user.email,
        password: "somethingTotallyInvalidHere",
      });
    expect(invalidPasswordResponse.status).toBe(400);

    const userDoesNotExistResponse = await unauthenticatedAgent
      .post("/tokens")
      .send({
        email: "iAmNotRegistered@example.net",
        password: "somethingTotallyInvalidHere",
      });
    expect(userDoesNotExistResponse.status).toBe(400);

    const invalidFieldsResponse = await unauthenticatedAgent
      .post("/tokens")
      .send({
        testing: "1234",
      });
    expect(invalidFieldsResponse.status).toBe(400);

    const tokenResponse = await unauthenticatedAgent.post("/tokens").send({
      email: user.email,
      password: userPlainPassword,
    });
    expect(tokenResponse.status).toBe(201);
    expect(tokenResponse.body).toEqual({
      token: expect.any(String),
    });

    const authenticatedRequestResponse = await unauthenticatedAgent
      .get("/restaurants")
      .set({
        Authorization: `Bearer ${tokenResponse.body.token}`,
      });
    expect(authenticatedRequestResponse.status).toBe(200);
  });
});
