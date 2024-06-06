const { casting, createCastSchema } = require("./db/dbCasting");
const uuid = require("uuid");

const castSchema = createCastSchema({
  created_at: casting.date,
  status_changed_at: casting.date,
});

const exposedFields = [
  "uuid",
  "coupon_code",
  "percentage",
  "restaurant_uuid",
  "created_at",
].join(", ");

class CouponModel {
  constructor(db) {
    this.db = db;
    this.modelName = "Coupon";
  }

  dbSetup() {
    this.db
      .prepare(
        `
      CREATE TABLE coupons (
        uuid TEXT PRIMARY KEY,
        coupon_code TEXT NOT NULL,
        percentage INTEGER NOT NULL,
        restaurant_uuid TEXT NOT NULL,
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
    coupon_code,
    percentage,
    restaurant_uuid,
    created_at,
    status,
    status_changed_at,
  }) {
    const stmt = this.db.prepare(`
      INSERT INTO coupons (
        uuid,
        coupon_code,
        percentage,
        restaurant_uuid,
        created_at,
        status,
        status_changed_at
      ) VALUES (
        :uuid,
        :coupon_code,
        :percentage,
        :restaurant_uuid,
        :created_at,
        :status,
        :status_changed_at
      ) RETURNING ${exposedFields}
    `);

    const sqlParams = castSchema.serialize({
      uuid: uuid.v4(),
      coupon_code,
      percentage,
      restaurant_uuid,
      created_at,
      status,
      status_changed_at,
    });

    const res = stmt.get(sqlParams);
    return castSchema.deserialize(res);
  }

  async list({ pageIndex, limit, restaurant_uuid }) {
    const stmt = this.db.prepare(`
      SELECT * FROM coupons
      WHERE restaurant_uuid = :restaurant_uuid
      ORDER BY created_at DESC
      LIMIT :limit OFFSET :offset
    `);

    const res = await stmt.all({
      restaurant_uuid,
      limit,
      offset: pageIndex * limit,
    });

    return res.map(castSchema.deserialize);
  }

  async get(uuid) {
    const stmt = this.db.prepare(`SELECT * FROM coupons WHERE uuid = ?`);
    const res = stmt.get(uuid);
    if (!res) {
      return null;
    }

    return castSchema.deserialize(res);
  }

  async getWithUuidAndOwnerUuid(uuid, owner_uuid) {
    const stmt = this.db.prepare(`
        SELECT * FROM coupons 
        WHERE uuid = ? AND restaurant_uuid IN (
            SELECT uuid FROM restaurants WHERE owner_uuid = ?
        )
    `);
    const res = stmt.get(uuid, owner_uuid);
    return res ? castSchema.deserialize(res) : null;
  }

  async getWithCodeAndRestaurantUUID(code, restaurant_uuid) {
    const stmt = this.db.prepare(`
        SELECT * FROM coupons
        WHERE coupon_code = ?
        AND restaurant_uuid = ?
    `);

    const res = stmt.get(code, restaurant_uuid);
    return res ? castSchema.deserialize(res) : null;
  }

  async getCouponPercentage(couponCode, restaurant_uuid) {
    const stmt = this.db.prepare(`
      SELECT percentage FROM coupons
      WHERE coupon_code = ?
      AND restaurant_uuid = ?
    `);

    const res = stmt.get(couponCode, restaurant_uuid);
    if (!res) {
      return null;
    }

    return res.percentage;
  }

  async update(uuid, data) {
    let updatePayload = {};
    const fields = ["coupon_code", "percentage", "status"];
    for (let field of fields) {
      if (data[field] !== undefined) {
        updatePayload[field] = data[field];
      }
    }
    let res;
    if (Object.keys(updatePayload).length > 0) {
      const sqlParams = castSchema.serialize(updatePayload);
      const sql = `UPDATE coupons SET ${Object.keys(sqlParams)
        .map((key) => `${key} = :${key}`)
        .join(", ")} WHERE uuid = :uuid RETURNING *`;
      const stmt = this.db.prepare(sql);
      res = stmt.get({ ...sqlParams, uuid: uuid });
    } else {
      res = this.db.prepare(`SELECT * FROM coupons WHERE uuid = ?`).get(uuid);
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
        UPDATE coupons 
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

module.exports = CouponModel;
