const ModelsRegistry = require("./../models");
const { createDb } = require("./db");
const config = require("./../../config");

async function dbReset(filename) {
  const newDb = createDb(filename);
  const models = new ModelsRegistry(newDb, config.jwtSecret);

  const promises = [];
  for (const model of models.allModels()) {
    if (model.dbSetup) {
      promises.push(Promise.resolve(model.dbSetup()));
    }
  }

  promises.push(seedAdmin(models));
  promises.push(seedTestUsers(models));
  await Promise.all(promises);

  newDb.exec("SELECT 1");

  return newDb;
}

async function seedAdmin(models) {
  const adminData = {
    email: "admin@example.com",
    password_hash: await models
      .users()
      .hashPassword("my.V3ry_Secu?re!$Password"),
    role: "admin",
    status: "active",
    created_at: new Date(),
  };

  await models.users().register(adminData);
}

async function seedTestUsers(models) {
  // Create test customer
  const customerData = {
    email: "customer@example.com",
    password_hash: await models.users().hashPassword("customer123"),
    role: "customer",
    status: "active",
    created_at: new Date(),
  };

  // Create test restaurant owner
  const ownerData = {
    email: "owner@example.com",
    password_hash: await models.users().hashPassword("owner123"),
    role: "owner",
    status: "active",
    created_at: new Date(),
  };

  // Create another test customer
  const customer2Data = {
    email: "customer2@example.com",
    password_hash: await models.users().hashPassword("customer123"),
    role: "customer",
    status: "active",
    created_at: new Date(),
  };

  await models.users().register(customerData);
  await models.users().register(ownerData);
  await models.users().register(customer2Data);
}

module.exports = { dbReset };
