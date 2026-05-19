trees = [
    {
        'id':0,
        'name':'oak',
        'description':'this is one cool tree ain\'t it partn\'',
        'picturepath':'image.png'
    }
]
users = [
    {
        'id':0,
        'role': 0,
        'nickname':'exampleUser',
        'login':'epicgamer',
        'password':'123456'
    }
]
comments = [
    {
        'id':0,
        'content':'loremipsum',
        'userid':0,
        'treeid':0
    }
]

const { createClient } = require('@libsql/client');

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('Connected to Turso database');

// Initialize tables (Turso requires executing statements individually)
async function initializeDatabase() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role INTEGER NOT NULL DEFAULT 0,
      nickname TEXT NOT NULL,
      login TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )`,
    
    `CREATE TABLE IF NOT EXISTS trees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      picturepath TEXT
    )`,
    
    `CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      userid INTEGER NOT NULL,
      treeid INTEGER,
      FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY (treeid) REFERENCES trees(id) ON DELETE CASCADE ON UPDATE CASCADE
    )`
  ];

  for (const tableSql of tables) {
    await db.execute(tableSql);
  }
  
  console.log('Database tables initialized');
}

initializeDatabase().catch(console.error);

module.exports = db;

async function seedDatabase() {
  // Check if users exist
  const users = await db.execute("SELECT * FROM users");
  if (users.rows.length === 0) {
    // Insert sample data
    await db.execute({
      sql: "INSERT INTO users (role, nickname, login, password) VALUES (?, ?, ?, ?)",
      args: [0, 'exampleUser', 'epicgamer', '123']
    });
    
    await db.execute({
      sql: "INSERT INTO trees (name, description, picturepath) VALUES (?, ?, ?)",
      args: ['oak', 'this is one cool tree ain\'t it partn\'', 'image.png']
    });
    
    await db.execute({
      sql: "INSERT INTO comments (content, userid, treeid) VALUES (?, ?, ?)",
      args: ['loremipsum', 0, 0]
    });
    
    console.log('Sample data seeded');
  }
}

seedDatabase().catch(console.error);