const sqlite3 = require('@libsql/sqlite3');

// Environment variables
const DATABASE_URL = process.env.TURSO_DATABASE_URL;
const AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

// Validate env vars
if (!DATABASE_URL) {
  throw new Error('Missing TURSO_DATABASE_URL');
}

if (!AUTH_TOKEN) {
  throw new Error('Missing TURSO_AUTH_TOKEN');
}

console.log('AUTH_TOKEN:', AUTH_TOKEN);
console.log('DATABASE_URL:', DATABASE_URL);

// Create Turso database connection
const db = new sqlite3.Database(DATABASE_URL, {
  authToken: AUTH_TOKEN,
});

console.log('Connected to Turso database using @libsql/sqlite3');

// Initialize tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role INTEGER NOT NULL DEFAULT 0,
      nickname TEXT NOT NULL,
      login TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  // Trees table
  db.run(`
    CREATE TABLE IF NOT EXISTS trees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      picturepath TEXT
    )
  `);

  // Comments table
  db.run(`
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

  console.log('Database tables initialized');

  // Seed database if empty
  db.get('SELECT COUNT(*) as count FROM users', (err, result) => {
    if (err) {
      console.error('Error checking users:', err);
      return;
    }

    if (result.count === 0) {
      console.log('Database empty – seeding sample data...');

      // Insert sample user
      db.run(
        `INSERT INTO users (role, nickname, login, password)
         VALUES (?, ?, ?, ?)`,
        [0, 'exampleUser', 'epicgamer', '123456']
      );

      // Insert sample tree
      db.run(
        `INSERT INTO trees (name, description, picturepath)
         VALUES (?, ?, ?)`,
        ['oak', "this is one cool tree ain't it partner", 'image.png']
      );

      // Insert sample comment
      db.run(
        `INSERT INTO comments (content, userid, treeid)
         VALUES (?, ?, ?)`,
        ['loremipsum', 1, 1]
      );

      console.log('Sample data seeded successfully');
    }
  });
});

module.exports = db;