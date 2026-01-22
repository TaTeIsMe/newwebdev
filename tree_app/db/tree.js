const db = require("./db");

function createTree(tree, callback) {
    const sql = `INSERT INTO trees (name, description, picture_path)
               VALUES (?, ?, ?)`;
    db.run(sql, [tree.name, tree.description, tree.picture_path], function (err) {
        if (err) return callback(err);
        callback(null, { id: this.lastID, ...tree });
    });
}

function deleteTree(id, callback){
    const sql = `DELETE FROM trees WHERE id = ? RETURNING *`;
    db.get(sql, [id], function (err, deletedTree) {
        if (err) return callback(err);
        callback(null, deletedTree);
    });
}

function updateTree(id, newTree, callback){
    const sql = `UPDATE trees SET name = ?,  description = ?, picture_path = ? WHERE id = ?`;
    db.run(sql, [newTree.name, newTree.description, newTree.picture_path, id], function (err) {
        if (err) return callback(err);
        callback(null);
    });
}

function getTrees(start, count, callback){
    const sql = `SELECT * FROM trees LIMIT ?, ?`;
    db.all(sql, [start, count], function (err, rows) {
        if (err) return callback(err);
        callback(null, rows);
    });
}

function getTree(id, callback){
    const sql = `SELECT * FROM trees WHERE id = ?`;
        db.get(sql, [id], function (err, row) {
        if (err) return callback(err);
        callback(null, row);
    });
}

module.exports = { createTree, deleteTree, updateTree, getTrees, getTree};