const sqlite3 = require("@libsql/sqlite3");

// Environment variables
const DATABASE_URL = process.env.TURSO_DATABASE_URL;
const AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

// Validate env vars
if (!DATABASE_URL || !AUTH_TOKEN) {
  throw new Error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
}

// FIX: Append the token to the URL as a query parameter
const connectionString = `${DATABASE_URL}?authToken=${AUTH_TOKEN}`;
const db = new sqlite3.Database(connectionString);

console.log("Connected to Turso database using @libsql/sqlite3");

try {
  // Enable foreign keys
  db.exec(`PRAGMA foreign_keys = ON`);

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role INTEGER NOT NULL DEFAULT 0,
      nickname TEXT NOT NULL,
      login TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  // Trees table
  db.exec(`
    CREATE TABLE IF NOT EXISTS trees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      picturepath TEXT
    )
  `);

  // Comments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      userid INTEGER NOT NULL,
      treeid INTEGER,
      FOREIGN KEY (userid) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      FOREIGN KEY (treeid) REFERENCES trees(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `);

  console.log("Database tables initialized");

  // Check if users table is empty
  const row = db.prepare(
    "SELECT COUNT(*) as count FROM users"
  ).get();

  if (row.count === 0) {
    console.log("Database empty – seeding sample data...");

    // Insert sample user
    db.prepare(`
      INSERT INTO users (role, nickname, login, password)
      VALUES (?, ?, ?, ?)
    `).run(0, "exampleUser", "epicgamer", "123456");

    // Insert sample tree
    db.prepare(`
      INSERT INTO trees (name, description, picturepath)
      VALUES (?, ?, ?)
    `).run(
      "oak",
      "this is one cool tree ain't it partner",
      "image.png"
    );

    // Insert sample comment
    db.prepare(`
      INSERT INTO comments (content, userid, treeid)
      VALUES (?, ?, ?)
    `).run(
      "loremipsum",
      1,
      1
    );

    console.log("Sample data seeded successfully");
  }

} catch (err) {
  console.error("Database error:", err);
}

module.exports = db;