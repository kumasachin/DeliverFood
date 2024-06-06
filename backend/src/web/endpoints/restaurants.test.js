const ModelsRegistry = require("../../model/models");
const buildTestEnvironment = require("../testutil/buildTestEnvironment");
const {
  restaurantSampleData,
  userSampleData,
} = require("../testutil/factories");

let authenticatedAgent;
/** @type {ModelsRegistry} */
let models;
beforeEach(async () => {
  const testEnv = await buildTestEnvironment();
  authenticatedAgent = await testEnv.buildAuthenticatedAgent();
  models = testEnv.models;
});

describe("Restaurants API", () => {
  describe("index", () => {
    it("fetches list of restaurants", async () => {
      const restaurant = await models
        .restaurants()
        .create(
          restaurantSampleData({ owner_uuid: authenticatedAgent.userUuid })
        );
      const response = await authenticatedAgent.get("/restaurants");

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toMatchObject({
        uuid: restaurant.uuid,
        average_rating: null,
      });
    });

    it("paginates", async () => {
      const creationPromises = [];
      for (let i = 0; i < 30; i++) {
        creationPromises.push(
          models.restaurants().create(
            restaurantSampleData({
              owner_uuid: authenticatedAgent.userUuid,
              title: `Rest #${i}`,
              created_at: new Date(Date.now() + i * 1000),
            })
          )
        );
      }
      await Promise.all(creationPromises);

      const page1 = await authenticatedAgent.get("/restaurants");
      expect(page1.status).toBe(200);
      expect(page1.body.length).toBe(20);
      expect(page1.body[0].title).toBe("Rest #29");
      expect(page1.body[19].title).toBe("Rest #10");

      const page2 = await authenticatedAgent.get("/restaurants?page=1");
      expect(page2.status).toBe(200);
      expect(page2.body.length).toBe(10);
      expect(page2.body[0].title).toBe("Rest #9");
      expect(page2.body[9].title).toBe("Rest #0");
    });
  });

  describe("show", () => {
    it("returns the restaurant", async () => {
      const restaurant = await models
        .restaurants()
        .create(
          restaurantSampleData({ owner_uuid: authenticatedAgent.userUuid })
        );
      const response = await authenticatedAgent.get(
        `/restaurants/${restaurant.uuid}`
      );
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        uuid: restaurant.uuid,
      });
    });

    it("returns 404 when not found", async () => {
      const response = await authenticatedAgent.get(
        `/restaurants/does-not-exist`
      );
      expect(response.status).toBe(404);
    });
  });

  describe("create", () => {
    it("enforces validations", async () => {
      await authenticatedAgent
        .post("/restaurants")
        .send({
          title: "Asd",
        })
        .expect(400);
    });

    it("creates restaurant when valid data is passed", async () => {
      const response = await authenticatedAgent.post("/restaurants").send({
        title: "My restaurant title",
        description: "Restaurant description",
        cuisine: "french",
        coordinates: { lat: "24.2395", lng: "-85.23819" },
      });
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        title: "My restaurant title",
        description: "Restaurant description",
        cuisine: "french",
        owner_uuid: authenticatedAgent.userUuid,
        coordinates: { lat: "24.2395", lng: "-85.23819" },
      });
    });

    it("creates restaurant without empty coordinates by default", async () => {
      const response = await authenticatedAgent.post("/restaurants").send({
        title: "My restaurant title",
        description: "Restaurant description",
        cuisine: "french",
      });
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        title: "My restaurant title",
        description: "Restaurant description",
        cuisine: "french",
        owner_uuid: authenticatedAgent.userUuid,
        coordinates: { lat: "", lng: "" },
      });
    });
  });

  describe("update", () => {
    it("updates restaurant", async () => {
      const restaurant = await models
        .restaurants()
        .create(
          restaurantSampleData({ owner_uuid: authenticatedAgent.userUuid })
        );
      const response = await authenticatedAgent
        .patch(`/restaurants/${restaurant.uuid}`)
        .send({
          title: "Updated title",
          coordinates: { lat: "24.2395", lng: "-85.23819" },
        });
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        title: "Updated title",
        coordinates: { lat: "24.2395", lng: "-85.23819" },
        description: restaurant.description, // Ensure it only touched the title and coordinates
      });
    });
  });

  describe("delete", () => {
    it("deletes restaurant", async () => {
      const restaurant = await models
        .restaurants()
        .create(
          restaurantSampleData({ owner_uuid: authenticatedAgent.userUuid })
        );
      const response = await authenticatedAgent.delete(
        `/restaurants/${restaurant.uuid}`
      );
      expect(response.status).toBe(204);

      const getResponse = await authenticatedAgent.get(
        `/restaurants/${restaurant.uuid}`
      );
      expect(getResponse.status).toBe(404);
    });

    it("gives 404 if restaurant does not exist", async () => {
      const response = await authenticatedAgent.delete(
        `/restaurants/does-not-exist`
      );
      expect(response.status).toBe(404);
    });

    it("gives 403 if authenticated user does not own the restaurant", async () => {
      const ownerUser = await models.users().register(
        userSampleData({
          password_hash: await models.users().hashPassword("testpass"),
        })
      );
      const restaurant = await models
        .restaurants()
        .create(restaurantSampleData({ owner_uuid: ownerUser.uuid }));
      const response = await authenticatedAgent.delete(
        `/restaurants/${restaurant.uuid}`
      );
      expect(response.status).toBe(403);
    });
  });
});
