const express = require('express');
const multer = require('multer');
const { z } = require('zod');
const { createTree, deleteTree, getTrees, getTree, updateTree } = require('../db/tree');
const { createComment, getComments } = require('../db/comment');
const { TreeSchema, CommentSchema } = require('../schemas/schemas');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');

const treeRouter = express.Router();

// S3 / Railway Bucket configuration
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  endpoint: process.env.BUCKET_ENDPOINT_URL,
  forcePathStyle: true,  // Required for Railway
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
    acl: 'public-read',   // Makes the file publicly accessible
  }),
});

// GET all trees (unchanged)
treeRouter.get('/', (req, res) => {
  const count = req.query.count ? parseInt(req.query.count) : 5;
  const start = req.query.page ? (parseInt(req.query.page) - 1) * count : 0;

  getTrees(start, count, (err, trees) => {
    if (err) return res.status(500).send({ status: err.message });
    res.json(trees);
  });
});

// GET single tree (unchanged)
treeRouter.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  getTree(id, (err, tree) => {
    if (err) return res.status(500).send({ status: err.message });
    res.json(tree);
  });
});

// DELETE tree
treeRouter.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (req.session.user.role != 0)
    return res.status(401).send({ status: 'only admins can change trees' });

  deleteTree(id, (err, deletedTree) => {
    if (err) return res.status(500).send({ status: err.message });
    // The image is stored in the cloud – no local file to delete.
    // (Optional: you could delete the image from S3 here using s3.deleteObject)
    res.send({ status: 'OK' });
  });
});

// CREATE tree (with image upload)
treeRouter.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(500).send({
      properties: { image: { errors: ['Please attach a tree image'] } },
    });
  }

  if (!req.session.user || req.session.user.role != 0) {
    // No local file to clean up – just return error
    return res.status(401).send({ status: 'Only administrators can add trees' });
  }

  const result = TreeSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json(z.treeifyError(result.error));
  }

  const parsed = result.data;
  // ✅ Store the cloud URL (multer-s3 provides req.file.location)
  const tree = { ...parsed, picture_path: req.file.location };

  createTree(tree, (err, newTree) => {
    if (err) {
      // No local file to delete – just report error
      return res.status(500).send({ status: err.message });
    }
    res.json(newTree);
  });
});

// UPDATE tree (with optional new image)
treeRouter.put('/:id', upload.single('image'), (req, res) => {
  const id = parseInt(req.params.id);

  if (!req.session.user || req.session.user.role != 0) {
    return res.status(401).send({ status: 'only admins can change trees' });
  }

  getTree(id, (err, oldTree) => {
    if (err) {
      return res.status(500).send({ status: err.message });
    }
    if (!oldTree) {
      return res.status(404).send({ status: 'Tree not found' });
    }

    // If a new file was uploaded, use its cloud URL; otherwise keep the old one
    const newImageUrl = req.file ? req.file.location : oldTree.picture_path;

    const result = TreeSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(z.treeifyError(result.error));
    }

    const parsed = result.data;
    const sentTree = { ...parsed, picture_path: newImageUrl };
    const newTree = Object.assign({}, oldTree, sentTree);

    updateTree(id, newTree, (err) => {
      if (err) {
        return res.status(500).send({ status: err.message });
      }
      // No local file to delete – old image remains in cloud.
      // (Optional: delete old image from S3 here if you want to save space)
      res.json(newTree);
    });
  });
});

// Comments routes (unchanged)
treeRouter.get('/:treeid/comments', (req, res) => {
  const count = req.query.count ? parseInt(req.query.count) : 5;
  const start = req.query.page ? (parseInt(req.query.page) - 1) * count : 0;
  const treeid = parseInt(req.params.treeid);

  getComments(start, count, treeid, (err, comments) => {
    if (err) return res.status(500).send({ status: err.message });
    res.json(comments);
  });
});

treeRouter.post('/:treeid/comments', upload.none(), (req, res) => {
  if (!req.session.user) return res.status(401).send({ status: 'Not logged in' });

  const userid = req.session.user.id;
  const treeid = parseInt(req.params.treeid);

  const result = CommentSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json(z.treeifyError(result.error));
  }

  const parsed = result.data;
  const comment = { ...parsed, userid, treeid };
  createComment(comment, (err, newComment) => {
    if (err) return res.status(500).send({ status: err.message });
    res.json(newComment);
  });
});

module.exports = treeRouter;