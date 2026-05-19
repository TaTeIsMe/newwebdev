const express = require('express')
const multer = require('multer')
const { z } = require('zod')
const fs = require('fs')
const { createTree, deleteTree, getTrees, getTree, updateTree } = require('../db/tree')
const { createComment, getComments } = require('../db/comment')
const { TreeSchema, CommentSchema } = require('../schemas/schemas')
const treeRouter = express.Router()


import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  // For Railway Buckets, also add:
  endpoint: process.env.BUCKET_ENDPOINT_URL,
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.BUCKET_NAME,
    key: function (req, file, cb) {
      cb(null, `trees/${Date.now()}_${file.originalname}`);
    },
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    // Make the file public (or omit if you'll generate signed URLs)
    acl: 'public-read',
  }),
});

treeRouter.get('/', (req, res) => {
    const count = req.query.count ? parseInt(req.query.count) : 5;
    const start = req.query.page ? (parseInt(req.query.page) - 1) * count : 0;

    getTrees(start, count, (err, trees) => {
        if (err) return res.status(500).send({status:err.message});
        res.json(trees);
    })
})


treeRouter.get('/:id', (req, res) => {
    const id = parseInt(req.params.id)
    getTree(id, (err, tree) => {
        if (err) return res.status(500).send({status:err.message});
        res.json(tree);
    })
})

treeRouter.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id)
    if (req.session.user.role != 0) return res.status(401).send({status:"only admins can change trees"})
    deleteTree(id, (err, deletedTree) => {
        if (err) return res.status(500).send({status:err.message});
        if (deletedTree.picture_path) {
            fs.unlink(deletedTree.picture_path, () => { });
        }
        res.send({"status":"OK"});
    })
})

treeRouter.post('/', upload.single('image'), (req, res) => {

    if(!req.file)return res.status(500).send({properties:{image:{errors:["Please attach a tree image"]}}});

    if (!req.session.user || req.session.user.role != 0) {
        console.log(req.session.user)
        fs.unlink(req.file.path, () => { });
        return res.status(401).send({status:"Only administrators can add trees"});
    }

    const result = TreeSchema.safeParse(req.body)

    if (!result.success) {
        return res.status(400).json(z.treeifyError(result.error));
    }

    const parsed = result.data

    const tree = { ...parsed, 'picture_path': req.file.path };
    createTree(tree, (err, newTree) => {
        if (err) {
            fs.unlink(req.file.path, () => { });
            return res.status(500).send({status:err.message});
        }
        res.json(newTree);
    })
})

treeRouter.put('/:id', upload.single('image'), (req, res) => {
    const id = parseInt(req.params.id)

    if ( !req.session.user || req.session.user.role != 0) return res.status(401).send({status:"only admins can change trees"})

    getTree(id, (err, oldTree) => {
        if (err) {
            if (req.file) fs.unlink(req.file.path, () => { });
            return res.status(500).send({status:err.message});
        }
        if (!oldTree) {
            if (req.file) fs.unlink(req.file.path, () => { });
            return res.status(404).send({status:"Tree not found"});
        }

        const newImagePath = req.file ? req.file.path : oldTree.picture_path;
        const oldImagePath = oldTree.picture_path;

        const result = TreeSchema.safeParse(req.body)

        if (!result.success) {
            return res.status(400).json(z.treeifyError(result.error));
        }

        const parsed = result.data

        const sentTree = { ...parsed, 'picture_path': newImagePath }
        const newTree = Object.assign({}, oldTree, sentTree)
        updateTree(id, newTree, (err) => {
            if (err) {
                if (req.file) fs.unlink(newImagePath, () => { });
                return res.status(500).send({status:err.message});
            }
            if (req.file && oldImagePath && oldImagePath !== newImagePath) {
                fs.unlink(oldImagePath, () => { });
            }
            res.json(newTree);
        })
    })
})

treeRouter.get('/:treeid/comments', (req, res) => {
    const count = req.query.count ? parseInt(req.query.count) : 5;
    const start = req.query.page ? (parseInt(req.query.page) - 1) * count : 0;
    const treeid = parseInt(req.params.treeid)

    getComments(start, count, treeid, (err, comments) => {
        if (err) return res.status(500).send({status:err.message});
        res.json(comments);
    })
})

treeRouter.post('/:treeid/comments', upload.none(), (req, res) => {
    if (!req.session.user)
        return res.status(401).send({status:"Not logged in"});

    const userid = req.session.user.id;
    const treeid = parseInt(req.params.treeid);

    const result = CommentSchema.safeParse(req.body)

    if (!result.success) {
        return res.status(400).json(z.treeifyError(result.error));
    }

    const parsed = result.data

    const comment = { ...parsed, userid, treeid };
    createComment(comment, (err, newComment) => {
        if (err) return res.status(500).send({status:err.message});
        res.json(newComment);
    })
})

module.exports = treeRouter