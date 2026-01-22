const db = require("./db");

function createUser(user, passwordHash, callback) {
    const sql = `INSERT INTO users (role, nickname, login, password)
               VALUES (1, ?, ?, ?)`;
    db.run(sql, [user.nickname, user.login, passwordHash], function (err) {
        if (err) return callback(err);
        callback(null, { id: this.lastID, ...user });
    });
}

function getUserByLogin(login, callback){
    const sql = `SELECT * FROM users WHERE login = ?`;
        db.get(sql, [login], function (err, row) {
        if (err) return callback(err);
        callback(null, row);
    });
}

function getUserById(id, callback){
    const sql = `SELECT * FROM users WHERE id = ?`;
        db.get(sql, [id], function (err, row) {
        if (err) return callback(err);
        callback(null, row);
    });
}

function deleteUser(id, callback){
    const sql = `DELETE FROM users WHERE id = ? `;
    db.run(sql, [id], function (err) {
        if (err) return callback(err);
        callback(null);
    });
}

function updateUser(id, newUser, callback){
    const sql = `UPDATE users SET role = ?, nickname = ?, login = ?, password = ? WHERE id = ?`;
    db.run(sql, [newUser.role, newUser.nickname, newUser.login, newUser.password, id], function (err) {
        if (err) return callback(err);
        callback(null);
    });
}

module.exports = {createUser, getUserByLogin, getUserById, deleteUser, updateUser}