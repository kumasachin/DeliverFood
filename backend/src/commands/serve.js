const config = require("../config");
const createServer = require("../web/createServer");
const ModelsRegistry = require("../model/models");
const db = require("../model/db/db");
const models = new ModelsRegistry(
  db.createDb(config.dbFilename),
  config.jwtSecret
);
const server = createServer(models);

const port = 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
