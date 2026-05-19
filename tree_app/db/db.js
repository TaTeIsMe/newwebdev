const sqlite3 = require("@libsql/sqlite3");

// Environment variables
const DATABASE_URL = process.env.TURSO_DATABASE_URL;
const AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

// Validate env vars
if (!DATABASE_URL || !AUTH_TOKEN) {
  throw new Error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
}

// Append the token to the URL as a query parameter
const connectionString = `${DATABASE_URL}?authToken=${AUTH_TOKEN}`;
const db = new sqlite3.Database(connectionString);

console.log("Connected to Turso database using @libsql/sqlite3");

// FIX 1: Wrap everything in db.serialize() to guarantee commands run in order
db.serialize(() => {
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
      picture_path TEXT
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

  console.log("Database schema checks queued...");

  // FIX 2: Use standard async db.get() with a callback instead of db.prepare().get()
  db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
    // FIX 3: Catch async execution errors inside the callback, not in a try/catch
    if (err) {
      console.error("Database error during count check:", err);
      return;
    }

    if (row && row.count === 0) {
      console.log("Database empty – seeding sample data...");

      // FIX 4: Use db.run() with a parameters array
      db.run(`
        INSERT INTO users (role, nickname, login, password)
        VALUES (?, ?, ?, ?)
      `, [1, "exampleUser", "epicgamer", "123456"], (err) => {
        if (err) console.error("Error seeding user:", err);
      });

      db.run(`
        INSERT INTO trees (name, description, picture_path)
        VALUES (?, ?, ?)
      `, ["oak", "this is one cool tree ain't it partner", "image.png"], (err) => {
        if (err) console.error("Error seeding tree:", err);
      });

      db.run(`
        INSERT INTO comments (content, userid, treeid)
        VALUES (?, ?, ?)
      `, ["loremipsum", 1, 1], (err) => {
        if (err) console.error("Error seeding comment:", err);
        else console.log("Sample data seeded successfully");
      });
    } else {
      console.log("Database already initialized with data. Skipping seed.");
    }
  });
});

module.exports = db;