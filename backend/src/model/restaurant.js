const { casting, createCastSchema, customCasters } = require("./db/dbCasting");
const uuid = require("uuid");

const castSchema = createCastSchema({
  created_at: casting.date,
  status_changed_at: casting.date,
}).addCustomCaster(
  customCasters.coordinates("coordinates", "coordinates_lat", "coordinates_lng")
);

class RestaurantModel {
  constructor(db) {
    this.db = db;
    this.modelName = "Restaurants";
  }

  dbSetup() {
    this.db
      .prepare(
        `
      CREATE TABLE restaurants (
        uuid TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        cuisine TEXT NOT NULL,
        owner_uuid TEXT NOT NULL,
        created_at TEXT NOT NULL,
        coordinates_lat TEXT NOT NULL,
        coordinates_lng TEXT NOT NULL,
        status TEXT NOT NULL,
        status_changed_at TEXT NOT NULL
      )
    `
      )
      .run();
  }

  async create({
    title,
    description,
    cuisine,
    owner_uuid,
    created_at,
    coordinates,
    status,
    status_changed_at,
  }) {
    const stmt = this.db.prepare(`
      INSERT INTO restaurants VALUES (
        :uuid,
        :title,
        :description,
        :cuisine,
        :owner_uuid,
        :created_at,
        :coordinates_lat,
        :coordinates_lng,
        :status,
        :status_changed_at
      ) RETURNING *
    `);
    const sqlParams = castSchema.serialize({
      uuid: uuid.v4(),
      title,
      description,
      cuisine,
      owner_uuid,
      created_at,
      coordinates,
      status,
      status_changed_at,
    });

    const res = stmt.get(sqlParams);
    return castSchema.deserialize(res);
  }

  async list({
    pageIndex,
    limit,
    title = null,
    description = null,
    cuisine = null,
    owner_uuid = null,
    status = "active",
  }) {
    const stmt = this.db.prepare(`
      SELECT * FROM restaurants
      WHERE status = :status
      AND (:title IS NULL OR LOWER(title) like LOWER(:title))
      AND (:description IS NULL OR LOWER(description) like LOWER(:description))
      AND (:cuisine IS NULL OR cuisine = :cuisine)
      AND (:owner_uuid IS NULL OR owner_uuid = :owner_uuid)
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${pageIndex * limit}
    `);

    const res = await stmt.all({
      title: title ? `%${title.toLowerCase()}%` : null,
      description: description ? `%${description.toLowerCase()}%` : null,
      cuisine,
      owner_uuid,
      status,
    });

    return res.map(castSchema.deserialize);
  }

  async destroy(uuid) {
    const stmt = this.db.prepare(`
      DELETE FROM restaurants 
      WHERE uuid = ?`);
    stmt.run(uuid);
  }

  async get(uuid) {
    const stmt = this.db.prepare(`
      SELECT * FROM restaurants 
      WHERE uuid = ?`);
    const res = stmt.get(uuid);
    if (!res) {
      return null;
    }

    return castSchema.deserialize(res);
  }

  async getByOwner(ownerUuid) {
    const stmt = this.db.prepare(`
      SELECT * FROM restaurants 
      WHERE owner_uuid = ?`);
    const res = stmt.all(ownerUuid);

    return res.map(castSchema.deserialize);
  }

  async getWithUuidAndOwnerUuid(uuid, owner_uuid) {
    const stmt = this.db.prepare(`
      SELECT * FROM restaurants 
      WHERE uuid = ? AND owner_uuid = ?
    `);
    const res = stmt.get(uuid, owner_uuid);
    if (!res) {
      return null;
    }

    return castSchema.deserialize(res);
  }

  async update(uuid, data) {
    let updatePayload = {};
    const fields = ["title", "description", "cuisine", "coordinates"];
    for (let field of fields) {
      if (data[field] !== undefined) {
        updatePayload[field] = data[field];
      }
    }
    let res;
    if (Object.keys(updatePayload).length > 0) {
      const sqlParams = castSchema.serialize(updatePayload);
      const sql = `UPDATE restaurants set ${Object.keys(sqlParams)
        .map((key) => `${key} = :${key}`)
        .join(", ")} WHERE uuid = ? RETURNING *`;
      const stmt = this.db.prepare(sql);
      res = stmt.get(sqlParams, uuid);
    } else {
      res = this.db
        .prepare(`SELECT * FROM restaurants WHERE uuid = ?`)
        .get(uuid);
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
        UPDATE restaurants 
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

  async listOrders({ restaurantUuid, pageIndex, limit, customerUuid }) {
    let query = `
        SELECT * FROM orders
        WHERE restaurant_uuid = :restaurantUuid
    `;

    const params = { restaurantUuid };

    if (customerUuid) {
      query += ` AND customer_uuid = :customerUuid`;
      params.customerUuid = customerUuid;
    }

    query += ` ORDER BY created_at DESC 
               LIMIT :limit OFFSET :offset`;

    const stmt = this.db.prepare(query);
    const res = await stmt.all({
      ...params,
      limit,
      offset: pageIndex * limit,
    });

    return res;
  }
}

module.exports = RestaurantModel;
