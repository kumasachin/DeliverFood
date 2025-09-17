const { casting, createCastSchema } = require("./db/dbCasting");
const uuid = require("uuid");
const crypto = require("crypto");

const castSchema = createCastSchema({
  created_at: casting.date,
});

const exposedFields = ["uuid", "email", "role", "status", "created_at"].join(
  ", "
);

const UniquenessErrorCode = "UNIQUENESS_CONSTRAINT";
class UniquenessError extends Error {
  code = UniquenessErrorCode;
}

class UserModel {
  UniquenessErrorCode = UniquenessErrorCode;

  constructor(db) {
    this.db = db;
    this.modelName = "Users";
  }

  dbSetup() {
    this.db
      .prepare(
        `
        CREATE TABLE users (
          uuid TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL,
          created_at TEXT NOT NULL,
          status TEXT NOT NULL
        )
      `
      )
      .run();

    this.db
      .prepare(
        `
      CREATE TABLE order_status_history (
        uuid TEXT PRIMARY KEY,
        order_uuid TEXT NOT NULL,
        status TEXT NOT NULL,
        changed_at TEXT NOT NULL,
        FOREIGN KEY (order_uuid) REFERENCES orders(uuid)
      )
      `
      )
      .run();
  }

  hashPassword(plainPassword) {
    const salt = crypto.randomBytes(32).toString("hex");
    return new Promise((res, rej) => {
      crypto.scrypt(plainPassword, salt, 64, (err, derivedKey) => {
        if (err) {
          rej(err);
        } else {
          const stringHash = derivedKey.toString("hex");
          res(`${stringHash}.${salt}`);
        }
      });
    });
  }

  comparePasswords({ plain, hash }) {
    const [actualHash, salt] = hash.split(".");
    const hashBuffer = Buffer.from(actualHash, "hex");

    return new Promise((res, rej) => {
      crypto.scrypt(plain, salt, 64, function (err, derivedKey) {
        if (err) {
          rej(err);
        } else {
          const isSame = crypto.timingSafeEqual(derivedKey, hashBuffer);
          res(isSame);
        }
      });
    });
  }

  async register({ email, created_at, password_hash, role }) {
    const stmt = this.db.prepare(`
      INSERT INTO users VALUES (
        :uuid,
        :email,
        :password_hash,
        :role,
        :created_at,
        :status
      ) RETURNING ${exposedFields}
    `);
    const sqlParams = castSchema.serialize({
      uuid: uuid.v4(),
      email,
      password_hash,
      role,
      created_at,
      status: "active",
    });
    try {
      const res = stmt.get(sqlParams);
      return castSchema.deserialize(res);
    } catch (e) {
      if (e.code === "SQLITE_CONSTRAINT_UNIQUE") {
        throw new UniquenessError();
      } else {
        throw e;
      }
    }
  }

  async list({ pageIndex, limit }) {
    const stmt = this.db.prepare(`
      SELECT ${exposedFields} FROM users
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${pageIndex * limit}
    `);

    const res = stmt.all();

    return res.map(castSchema.deserialize);
  }

  async get(uuid) {
    const stmt = this.db.prepare(
      `SELECT ${exposedFields} FROM users WHERE uuid = ?`
    );
    const res = stmt.get(uuid);
    if (!res) {
      return null;
    }

    return castSchema.deserialize(res);
  }

  async getByStatus(status) {
    const stmt = this.db.prepare(
      `SELECT ${exposedFields} FROM users WHERE status = ? ORDER BY created_at DESC`
    );
    const res = stmt.all(status);
    return res.map(castSchema.deserialize);
  }

  async getByEmail(email) {
    const stmt = this.db.prepare(
      `SELECT uuid, password_hash, role, status FROM users WHERE email = ?`
    );
    const res = stmt.get(email);
    if (!res) {
      return null;
    }

    return {
      uuid: res.uuid,
      password_hash: res.password_hash,
      role: res.role,
      status: res.status,
    };
  }

  async updateStatus(uuid, status) {
    const sqlParams = castSchema.serialize({
      uuid,
      status,
    });

    const row = await this.db
      .prepare(
        `
      UPDATE users
      SET
        status = :status
      WHERE uuid = :uuid
      RETURNING ${exposedFields}
    `
      )
      .get(sqlParams);
  }

  async isRestaurantOwner(order_uuid, user_uuid) {
    const sqlParams = {
      order_uuid: order_uuid.toString(),
      user_uuid: user_uuid.toString(),
    };

    const result = await this.db
      .prepare(
        `
      SELECT u.role
      FROM orders AS o
      JOIN restaurants AS r ON o.restaurant_uuid = r.uuid
      JOIN users AS u ON r.owner_uuid = u.uuid
      WHERE o.uuid = :order_uuid AND u.uuid = :user_uuid
    `
      )
      .get(sqlParams);

    return result && result.role === "owner";
  }

  async isRestaurantMealOwner(meal_uuid, user_uuid) {
    const sqlParams = {
      meal_uuid: meal_uuid.toString(),
      user_uuid: user_uuid.toString(),
    };

    const result = await this.db
      .prepare(
        `
      SELECT u.role
      FROM meals AS m
      JOIN restaurants AS r ON m.restaurant_uuid = r.uuid
      JOIN users AS u ON r.owner_uuid = u.uuid
      WHERE m.uuid = :meal_uuid AND u.uuid = :user_uuid
  `
      )
      .get(sqlParams);

    return result && result.role === "owner";
  }
}

module.exports = UserModel;
