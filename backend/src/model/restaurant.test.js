const { createDb } = require("./db/db");
const { dbReset } = require("./db/dbReset");
const RestaurantModel = require("./restaurant");

const defaultSampleData = {
  title: "MyRestaurant",
  description: "Restaurant description",
  cuisine: "italian",
  created_at: new Date(),
  owner_uuid: "some-uuid",
};

function createSampleData(override) {
  return { ...defaultSampleData, ...override };
}

let db;
/** @type {RestaurantModel} */
let restaurants;
beforeEach(async () => {
  db = createDb();
  db = await dbReset();
  restaurants = new RestaurantModel(db);
});

describe("RestaurantModel", () => {
  describe("create", () => {
    test("creating restaurant", async () => {
      const data = createSampleData();
      const restaurant = await restaurants.create(data);
      expect(restaurant).toMatchObject({
        uuid: expect.any(String),
        ...data,
      });
    });
  });

  describe("list", () => {
    test("filtering by cuisine", async () => {
      const italian = await restaurants.create(
        createSampleData({
          title: "Italian restaurant",
          cuisine: "italian",
        })
      );
      const french = await restaurants.create(
        createSampleData({
          title: "French restaurant",
          cuisine: "french",
        })
      );

      expect(
        await restaurants.list({ pageIndex: 0, limit: 100, cuisine: "french" })
      ).toEqual([french]);
      expect(
        await restaurants.list({ pageIndex: 0, limit: 100, cuisine: "italian" })
      ).toEqual([italian]);
    });

    test("pagination", async () => {
      const [r1, r2, r3] = [
        await restaurants.create(
          createSampleData({
            title: "1",
            created_at: new Date("2024-01-01T00:00:00.000Z"),
          })
        ),
        await restaurants.create(
          createSampleData({
            title: "2",
            created_at: new Date("2024-01-02T00:00:00.000Z"),
          })
        ),
        await restaurants.create(
          createSampleData({
            title: "3",
            created_at: new Date("2024-01-03T00:00:00.000Z"),
          })
        ),
      ];

      // Respects created_at ordering
      expect(await restaurants.list({ pageIndex: 0, limit: 1 })).toEqual([r3]);
      // Limit works correctly
      expect(await restaurants.list({ pageIndex: 0, limit: 2 })).toEqual([
        r3,
        r2,
      ]);
      // Page index works correctly
      expect(await restaurants.list({ pageIndex: 1, limit: 2 })).toEqual([r1]);
      expect(await restaurants.list({ pageIndex: 1, limit: 1 })).toEqual([r2]);
    });
  });

  test("destroy", async () => {
    const restaurant = await restaurants.create(createSampleData());
    await restaurants.destroy(restaurant.uuid);
    expect(await restaurants.get(restaurant.uuid)).toBe(null);
  });

  describe("update", () => {
    it("updates existing record", async () => {
      const restaurant = await restaurants.create(createSampleData());
      const updatedRestaurant = await restaurants.update(restaurant.uuid, {
        title: "Updated title",
      });
      expect(updatedRestaurant).toMatchObject({
        title: "Updated title", // Updates provided field
        description: restaurant.description, // Leaves other fields as they were
      });
    });

    it("does nothing if empty data is provided", async () => {
      const restaurant = await restaurants.create(createSampleData());
      const updatedRestaurant = await restaurants.update(restaurant.uuid, {});
      expect(updatedRestaurant).toMatchObject(restaurant);
    });

    it("errors if record does not exist", async () => {
      await expect(
        async () =>
          await restaurants.update("UUIDThatDoesNotExist", {
            title: "Some data",
          })
      ).rejects.toThrowErrorMatchingInlineSnapshot(`"Record not found"`);
    });
  });
});
