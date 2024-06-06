const ModelsRegistry = require('./../models');
const { createDb } = require('./db');
const config = require('./../../config');

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
  await Promise.all(promises);

  newDb.exec('SELECT 1');

  return newDb;
}

async function seedAdmin(models) {
  const adminData = {
    email: 'admin@example.com',
    password_hash: await models.users().hashPassword('my.V3ry_Secu?re!$Password'),
    role: 'admin',
    status: 'active',
    created_at: new Date(),
  };

  await models.users().register(adminData);
}

module.exports = { dbReset };
