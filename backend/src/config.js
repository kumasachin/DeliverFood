const path = require("path");

const config = {
  dbFilename: path.join(__dirname, "../db/devdb.sqlite"),
  jwtSecret: "myDevelopmentJWTSecretHere",
};

module.exports = config;
