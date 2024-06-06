const { createDb } = require("./db/db");
const { dbReset } = require("./db/dbReset");
const UserModel = require("./user");

const defaultSampleData = {
  email: "mytestuser@example.com",
  created_at: new Date(),
};
function createSampleData(override) {
  return { ...defaultSampleData, ...override };
}

let db;
/** @type {UserModel} */
let users;
beforeEach(async () => {
  db = createDb();
  db = await dbReset();
  users = new UserModel(db);
});

describe("UserModel", () => {
  test("password hashing", async () => {
    const hash = await users.hashPassword("testing");
    expect(await users.comparePasswords({ plain: "testing", hash: hash })).toBe(
      true
    );
    expect(await users.comparePasswords({ plain: "test", hash: hash })).toBe(
      false
    );
  });

  test("register", async () => {
    const now = new Date();
    const user = await users.register({
      email: "testing@example.com",
      created_at: now,
      password_hash: await users.hashPassword("testpass"),
    });

    expect(user).toMatchObject({
      uuid: expect.any(String),
      email: "testing@example.com",
      created_at: now,
    });
  });

  describe("get", () => {
    test("getting a single user", async () => {
      const now = new Date();
      const registeredUser = await users.register({
        email: "testing@example.com",
        created_at: now,
        password_hash: await users.hashPassword("testpass"),
      });

      const loadedUser = await users.get(registeredUser.uuid);
      expect(loadedUser).toStrictEqual(registeredUser);
    });

    test("getting a user that does not exist", async () => {
      expect(await users.get("does-not-exist")).toBe(null);
    });
  });

  describe("getPasswordHashByEmail", () => {
    test("getting password hash", async () => {
      const now = new Date();
      const passwordHash = await users.hashPassword("testpass");
      const registeredUser = await users.register({
        email: "testing@example.com",
        created_at: now,
        password_hash: passwordHash,
      });

      const hash = await users.getPasswordHashAndUuidByEmail(
        registeredUser.email
      );
      expect(hash).toStrictEqual({
        uuid: registeredUser.uuid,
        password_hash: passwordHash,
      });
    });

    test("getting a user that does not exist", async () => {
      expect(await users.getPasswordHashAndUuidByEmail("does-not-exist")).toBe(
        null
      );
    });
  });

  describe("list", () => {
    test("pagination", async () => {
      const [u1, u2, u3] = [
        await users.register(
          createSampleData({
            email: "u1@example.com",
            created_at: new Date("2022-01-01T00:00:00.000Z"),
            password_hash: await users.hashPassword("testing"),
          })
        ),
        await users.register(
          createSampleData({
            email: "u2@example.com",
            created_at: new Date("2022-01-02T00:00:00.000Z"),
            password_hash: await users.hashPassword("testing"),
          })
        ),
        await users.register(
          createSampleData({
            email: "u3@example.com",
            created_at: new Date("2022-01-03T00:00:00.000Z"),
            password_hash: await users.hashPassword("testing"),
          })
        ),
      ];

      // Respects created_at ordering
      expect(await users.list({ pageIndex: 0, limit: 1 })).toEqual([u3]);
      // Limit works correctly
      expect(await users.list({ pageIndex: 0, limit: 2 })).toEqual([u3, u2]);
      // Page index works correctly
      expect(await users.list({ pageIndex: 1, limit: 2 })).toEqual([u1]);
      expect(await users.list({ pageIndex: 1, limit: 1 })).toEqual([u2]);
    });
  });
});
