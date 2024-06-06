const swaggerUi = require("swagger-ui-express");
const YAML = require("yaml");
const fs = require("fs");

module.exports = function attachSwagger(app, urlPath) {
  const file = fs.readFileSync("./openapi.yaml", "utf8");
  const swaggerDocument = YAML.parse(file);

  app.use(urlPath, swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
