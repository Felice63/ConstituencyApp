const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'constituents.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS constituents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    address TEXT NOT NULL,
    wardNumber INTEGER NOT NULL,
    householdSize INTEGER NOT NULL,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entityType TEXT NOT NULL,
    entityId INTEGER NOT NULL,
    action TEXT NOT NULL,
    oldData TEXT,
    newData TEXT,
    changes TEXT,
    timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db;
