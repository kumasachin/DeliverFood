const { casting, createCastSchema } = require("./db/dbCasting");
const uuid = require("uuid");
const Meal = require("./meal");

const castSchema = createCastSchema({
  created_at: casting.date,
  updated_at: casting.date,
  status_changed_at: casting.date,
});

const STATUS_TRANSITIONS = {
  placed: ["processing", "cancelled"],
  processing: ["in route", "cancelled"],
  "in route": ["delivered", "cancelled"],
  delivered: ["received"],
  received: [],
  cancelled: [],
};

class OrderModel {
  constructor(db) {
    this.db = db;
    this.modelName = "Orders";
  }

  dbSetup() {
    this.db
      .prepare(
        `
          CREATE TABLE orders (
            uuid TEXT PRIMARY KEY,
            customer_uuid TEXT NOT NULL,
            restaurant_uuid TEXT NOT NULL,
            status TEXT NOT NULL,
            total_price INTEGER NOT NULL,
            tip_amount INTEGER,
            discount_percentage INTEGER,
            coupon_code TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT,
            FOREIGN KEY (customer_uuid) REFERENCES users(uuid),
            FOREIGN KEY (restaurant_uuid) REFERENCES restaurants(uuid)
          )
      `
      )
      .run();
  }

  async create({
    customer_uuid,
    restaurant_uuid,
    status = "placed",
    tip_amount = 0,
    discount_percentage,
    coupon_code = null,
    order_items = [],
  }) {
    const meals = new Meal(this.db);
    const order_uuid = uuid.v4();

    let fullOrderItems = [];
    let total_price = 0;
    for (const item of order_items) {
      const meal = await meals.getMealPriceAndTitle(item.meal_uuid);

      total_price += parseInt(meal.price, 10) * item.quantity;
      fullOrderItems.push({
        ...item,
        price: meal.price,
        title: meal.title,
      });
    }

    const discountAmount = (total_price * discount_percentage) / 100;
    const discountedSubtotal = total_price - discountAmount;

    total_price = discountedSubtotal + tip_amount;

    const insertOrderStmt = this.db.prepare(`
            INSERT INTO orders (
                uuid,
                customer_uuid,
                restaurant_uuid,
                status,
                total_price,
                tip_amount,
                discount_percentage,
                coupon_code,
                created_at,
                updated_at
            ) VALUES (
                :uuid,
                :customer_uuid,
                :restaurant_uuid,
                :status,
                :total_price,
                :tip_amount,
                :discount_percentage,
                :coupon_code,
                :created_at,
                :updated_at
            ) RETURNING *
        `);

    const created_at = new Date().toISOString();
    const updated_at = created_at;

    const orderResult = await insertOrderStmt.get({
      uuid: order_uuid,
      customer_uuid,
      restaurant_uuid,
      status: status,
      total_price,
      tip_amount,
      discount_percentage,
      coupon_code,
      created_at,
      updated_at,
    });

    const insertOrderItemStmt = this.db.prepare(`
            INSERT INTO order_items (
                uuid,
                order_uuid,
                meal_uuid,
                quantity,
                price
            ) VALUES (
                :uuid,
                :order_uuid,
                :meal_uuid,
                :quantity,
                :price
            ) RETURNING *
        `);

    for (const item of fullOrderItems) {
      await insertOrderItemStmt.run({
        uuid: uuid.v4(),
        order_uuid,
        meal_uuid: item.meal_uuid,
        quantity: item.quantity,
        price: item.price,
      });
    }

    await this.db
      .prepare(
        `
            INSERT INTO order_status_history (
                uuid,
                order_uuid, 
                status, 
                changed_at
            ) VALUES (
                :uuid,
                :order_uuid, 
                :status, 
                :changed_at
            )
        `
      )
      .run({
        uuid: uuid.v4(),
        order_uuid,
        status,
        changed_at: created_at,
      });

    return {
      ...orderResult,
      order_items: fullOrderItems,
    };
  }

  async list({ pageIndex, limit, customerUuid }) {
    const stmt = this.db.prepare(`
            SELECT * FROM orders
            WHERE customer_uuid = :customerUuid
            ORDER BY created_at DESC
            LIMIT :limit OFFSET :offset
        `);

    const res = await stmt.all({
      customerUuid,
      limit,
      offset: pageIndex * limit,
    });

    return res.map(castSchema.deserialize);
  }

  async get(uuid) {
    const stmt = this.db.prepare(`
            SELECT * FROM orders 
            WHERE uuid = ?`);
    const res = stmt.get(uuid);
    if (!res) {
      return null;
    }

    return castSchema.deserialize(res);
  }

  async getStatus(uuid) {
    const stmt = this.db.prepare(`
            SELECT status, updated_at FROM orders 
            WHERE uuid = ?
        `);
    const res = stmt.get(uuid);
    if (!res) {
      return null;
    }

    return {
      status: res.status,
      updated_at: res.updated_at,
    };
  }

  async getOrderHistory(order_uuid) {
    const stmt = this.db.prepare(`
            SELECT status, changed_at
            FROM order_status_history
            WHERE order_uuid = ?
            ORDER BY changed_at DESC
        `);
    const res = stmt.all(order_uuid);
    return res;
  }

  async updateStatus(order_uuid, status) {
    const currentStatusRow = await this.db
      .prepare(
        `
            SELECT status
            FROM orders
            WHERE uuid = :order_uuid
        `
      )
      .get({ order_uuid });

    const currentStatus = currentStatusRow.status;

    if (!STATUS_TRANSITIONS[currentStatus].includes(status)) {
      return {
        error: `Invalid status transition from ${currentStatus} to ${status}.`,
      };
    }

    let sqlParams = castSchema.serialize({
      order_uuid,
      status,
      updated_at: new Date(),
    });

    const row = await this.db
      .prepare(
        `
            UPDATE orders 
            SET 
                status = :status,
                updated_at = :updated_at
            WHERE uuid = :order_uuid
            RETURNING *
        `
      )
      .get(sqlParams);

    const history_uuid = uuid.v4();
    sqlParams = {
      ...sqlParams,
      uuid: history_uuid,
    };

    await this.db
      .prepare(
        `
            INSERT INTO order_status_history (
                uuid,
                order_uuid, 
                status, 
                changed_at)
            VALUES (
                :uuid,
                :order_uuid, 
                :status, 
                :updated_at)
        `
      )
      .run(sqlParams);

    return row;
  }
}

module.exports = OrderModel;
