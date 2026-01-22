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
        'password':'123'
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

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./data.db');

db.serialize(() => {
  // USERS
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role INTEGER NOT NULL DEFAULT 0,
      nickname TEXT NOT NULL,
      login TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  // TREES
  db.run(`
    CREATE TABLE IF NOT EXISTS trees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      picturepath TEXT
    )
  `);

  // COMMENTS
  db.run(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      userid INTEGER NOT NULL,
      treeid INTEGER,
      FOREIGN KEY (userid) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY (treeid) REFERENCES trees(id)
        ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);
});

module.exports = db;