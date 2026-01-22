const db = require("./db");

function createComment(comment, callback) {
    const sql = `INSERT INTO comments (content, user_id, tree_id)
               VALUES (?, ?, ?)`;
    db.run(sql, [comment.content, comment.userid, comment.treeid], function (err) {
        if (err) return callback(err);
        callback(null, { id: this.lastID, ...comment });
    });
}

function getComments(start, count, treeid, callback){
    const sql = `SELECT * FROM comments WHERE tree_id = ? LIMIT ?, ?`;
    db.all(sql, [treeid, start, count], function (err, rows) {
        if (err) return callback(err);
        callback(null, rows);
    });
}

function getCommentsByUserId(start, count, userid, callback){
    const sql = `SELECT * FROM comments WHERE user_id = ? LIMIT ?, ?`;
    db.all(sql, [userid, start, count], function (err, rows) {
        if (err) return callback(err);
        callback(null, rows);
    });
}

function getComment(id, callback){
    const sql = `SELECT * FROM comments WHERE id = ?`;
        db.get(sql, [id], function (err, row) {
        if (err) return callback(err);
        callback(null, row);
    });
}

function updateComment(id, newComment, callback){
    const sql = `UPDATE comments SET content = ? WHERE id = ?`;
    db.run(sql, [newComment.content, id], function (err) {
        if (err) return callback(err);
        callback(null);
    });
}

function deleteComment(id, callback){
    const sql = `DELETE FROM comments WHERE id = ? `;
    db.run(sql, [id], function (err) {
        if (err) return callback(err);
        callback(null);
    });
}


module.exports = { createComment, getComments, getComment, updateComment, deleteComment, getCommentsByUserId};