class OrderItemModel {
  constructor(db) {
    this.db = db;
    this.modelName = "OrderItems";
  }

  dbSetup() {
    this.db
      .prepare(
        `
          CREATE TABLE order_items (
            uuid TEXT PRIMARY KEY,
            order_uuid TEXT NOT NULL,
            meal_uuid TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            price INTEGER NOT NULL,
            FOREIGN KEY (order_uuid) REFERENCES orders(uuid),
            FOREIGN KEY (meal_uuid) REFERENCES meals(uuid)
          )
      `
      )
      .run();
  }
}

module.exports = OrderItemModel;
