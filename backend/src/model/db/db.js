const sqlite = require('better-sqlite3');

function createDb(filename) {
  if (!filename) {
    filename = ':memory:';
  }

  const db = sqlite(filename, {
    // verbose: console.log,
  });
  db.pragma('journal_mode = WAL');

  db._filename = filename;

  return db;
}

module.exports = {
  createDb,
};
