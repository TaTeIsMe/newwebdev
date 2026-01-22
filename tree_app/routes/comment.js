const express = require('express')
const multer = require('multer')
const { getComment, updateComment, deleteComment } = require('../db/comment')
const { CommentSchema } = require('../schemas/schemas')
const { z } = require('zod')
const commentRouter = express.Router()
const upload = multer({ dest: 'uploads/' })


commentRouter.get('/:id', (req,res) => {
    const id = parseInt(req.params.id)
    getComment(id, (err, comment)=>{
        if (err) return res.status(500).send({status:err.message});
        res.json(comment);
    })
})

commentRouter.put('/:id',upload.none(), (req,res) => {
    const id = parseInt(req.params.id)
    const result = CommentSchema.safeParse(req.body)

    if (!result.success) {
        return res.status(400).json(z.treeifyError(result.error));
    }

    const parsed = result.data

    getComment(id, (err, oldComment)=>{
        if (err) return res.status(500).send({status:err.message});

        if (!req.session.user)
            return res.status(401).send({status:"Not logged in"});
        if(req.session.user.id != oldComment.user_id)
            return res.status(401).send({status:"Can't modify others' comments"});

        const sentComment = parsed
        const newComment = Object.assign({}, oldComment, sentComment)
        updateComment(id, newComment, (err) => {
            if (err) return res.status(500).send({status:err.message});
            res.json(newComment);
        })
    })
})

commentRouter.delete('/:id', (req,res) => {
    const id = parseInt(req.params.id)
    if (!req.session.user)
        return res.status(401).send("Not logged in");

    getComment(id, (err, comment)=>{
        if (err) return res.status(500).send({status:err.message});

        if(req.session.user.id != comment.user_id)
            return res.status(401).send({status:"Can't modify others' comments"});

        deleteComment( id, (err) => {
            if (err) return res.status(500).send(err.message);
            res.send({"status":"OK"});
        })
    })
})

module.exports = commentRouter