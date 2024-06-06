const { casting, createCastSchema } = require("./db/dbCasting");
const uuid = require("uuid");

const castSchema = createCastSchema({
  created_at: casting.date,
  status_changed_at: casting.date,
});

const exposedFields = [
  "uuid",
  "restaurant_uuid",
  "title",
  "description",
  "price",
  "section",
  "created_at",
].join(", ");

class MealModel {
  constructor(db) {
    this.db = db;
    this.modelName = "Meals";
  }

  dbSetup() {
    this.db
      .prepare(
        `
        CREATE TABLE meals (
          uuid TEXT PRIMARY KEY,
          restaurant_uuid TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          price INTEGER NOT NULL,
          section Text NOT NULL,
          created_at TEXT NOT NULL,
          status TEXT NOT NULL,
          status_changed_at TEXT NOT NULL,
          FOREIGN KEY (restaurant_uuid) REFERENCES restaurants(uuid)
        )
      `
      )
      .run();
  }

  async create({
    title,
    description,
    price,
    section,
    created_at,
    status,
    status_changed_at,
    restaurant_uuid,
  }) {
    const stmt = this.db.prepare(`
        INSERT INTO meals (
          uuid,
          restaurant_uuid,
          title,
          description,
          price,
          created_at,
          status,
          status_changed_at,
          section
        ) VALUES (
          :uuid,
          :restaurant_uuid,
          :title,
          :description,
          :price,
          :created_at,
          :status,
          :status_changed_at,
          :section
        ) RETURNING ${exposedFields}
      `);
    const sqlParams = castSchema.serialize({
      uuid: uuid.v4(),
      restaurant_uuid,
      title,
      description,
      price,
      created_at,
      status,
      status_changed_at,
      section,
    });

    const res = stmt.get(sqlParams);
    return castSchema.deserialize(res);
  }

  async list({ pageIndex, limit, restaurant_uuid, status = "active" }) {
    const stmt = this.db.prepare(`
      SELECT * FROM meals
      WHERE status = :status
      AND restaurant_uuid = :restaurant_uuid
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${pageIndex * limit}
    `);

    const res = await stmt.all({
      restaurant_uuid,
      status,
    });

    return res.map(castSchema.deserialize);
  }

  async get(uuid) {
    const stmt = this.db.prepare(`SELECT * FROM meals WHERE uuid = ?`);
    const res = stmt.get(uuid);
    if (!res) {
      return null;
    }

    return castSchema.deserialize(res);
  }

  async getWithUuidAndOwnerUuid(uuid, owner_uuid) {
    const stmt = this.db.prepare(`
          SELECT * FROM meals 
          WHERE uuid = ? AND restaurant_uuid IN (
              SELECT uuid FROM restaurants WHERE owner_uuid = ?
          )
      `);
    const res = stmt.get(uuid, owner_uuid);
    if (!res) {
      return null;
    }

    return castSchema.deserialize(res);
  }

  async getMealPriceAndTitle(uuid) {
    const stmt = this.db.prepare(
      `SELECT title, price FROM meals WHERE uuid = ?`
    );
    const res = stmt.get(uuid);
    if (!res) {
      return null;
    }
    return castSchema.deserialize(res);
  }

  async getMealRestaurantUuid(uuid) {
    const stmt = this.db.prepare(
      `SELECT restaurant_uuid FROM meals WHERE uuid = ?`
    );
    const res = stmt.get(uuid);
    if (!res) {
      return null;
    }
    return res.restaurant_uuid;
  }

  async update(uuid, data) {
    let updatePayload = {};
    const fields = ["title", "description", "price", "section"];
    for (let field of fields) {
      if (data[field] !== undefined) {
        updatePayload[field] = data[field];
      }
    }
    let res;
    if (Object.keys(updatePayload).length > 0) {
      const sqlParams = castSchema.serialize(updatePayload);
      const sql = `UPDATE meals set ${Object.keys(sqlParams)
        .map((key) => `${key} = :${key}`)
        .join(", ")} 
          WHERE uuid = ? 
          RETURNING ${exposedFields}`;
      const stmt = this.db.prepare(sql);
      res = stmt.get(sqlParams, uuid);
    } else {
      res = this.db.prepare(`SELECT * FROM meals WHERE uuid = ?`).get(uuid);
    }

    if (!res) {
      throw new Error("Record not found");
    }

    return castSchema.deserialize(res);
  }

  async updateStatus(uuid, status) {
    const sqlParams = castSchema.serialize({
      uuid,
      status,
      status_changed_at: new Date(),
    });

    const row = await this.db
      .prepare(
        `
          UPDATE meals 
          SET 
              status = :status,
              status_changed_at = :status_changed_at
          WHERE uuid = :uuid
          RETURNING *
      `
      )
      .get(sqlParams);

    return row;
  }
}

module.exports = MealModel;
