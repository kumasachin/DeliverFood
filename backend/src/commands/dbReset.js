const { dbReset } = require("../model/db/dbReset");
const fs = require("fs").promises;
const config = require("../config");

async function fileExists() {
  try {
    await fs.stat(config.dbFilename);
    return true;
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw err;
    } else {
      return false;
    }
  }
}

(async () => {
  if (await fileExists(config.dbFilename)) {
    await fs.unlink(config.dbFilename);
  }
  await dbReset(config.dbFilename);
})();
