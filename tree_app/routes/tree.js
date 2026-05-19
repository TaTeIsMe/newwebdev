const express = require('express');
const multer = require('multer');
const { z } = require('zod');
const { createTree, deleteTree, getTrees, getTree, updateTree } = require('../db/tree');
const { createComment, getComments } = require('../db/comment');
const { TreeSchema, CommentSchema } = require('../schemas/schemas');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const treeRouter = express.Router();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'trees',
        format: async (req, file) => 'jpg', // You can make this dynamic based on file.mimetype
        public_id: (req, file) => `${Date.now()}_${file.originalname.split('.')[0]}`
    }
});

const upload = multer({ storage: storage });

// GET all trees
treeRouter.get('/', (req, res) => {
  const count = req.query.count ? parseInt(req.query.count) : 5;
  const start = req.query.page ? (parseInt(req.query.page) - 1) * count : 0;

  getTrees(start, count, (err, trees) => {
    if (err) return res.status(500).send({ status: err.message });
    res.json(trees);
  });
});

// GET single tree
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
if (!req.session.user || req.session.user.role != 0) {
  return res.status(401).send({ status: 'only admins can change trees' });
}

  deleteTree(id, (err, deletedTree) => {
    if (err) return res.status(500).send({ status: err.message });
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
    return res.status(401).send({ status: 'Only administrators can add trees' });
  }

  const result = TreeSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json(z.treeifyError(result.error));
  }

  const parsed = result.data;
  const tree = { ...parsed, picture_path: req.file.path };

  createTree(tree, (err, newTree) => {
    if (err) {
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

    // If a new file was uploaded, use Cloudinary URL; otherwise keep the old one
    const newImageUrl = req.file ? req.file.path : oldTree.picture_path;

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
      res.json(newTree);
    });
  });
});

// Comments routes
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