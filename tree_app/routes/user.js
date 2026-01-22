const express = require('express')
const userRouter = express.Router()
const bcrypt = require('bcrypt');
const multer = require('multer');
const { z } = require('zod')
const { createUser, getUserByLogin, getUserById, deleteUser, updateUser } = require('../db/user');
const { getCommentsByUserId } = require('../db/comment');
const { RegistrationSchema, LoginSchema, UpdateUserSchema } = require('../schemas/schemas');
const upload = multer({ dest: 'uploads/' })

userRouter.post('/register', upload.none(), (req, res) => {

    const result = RegistrationSchema.safeParse(req.body)

    if (!result.success) {
        return res.status(400).json(z.treeifyError(result.error));
    }

    const parsed = result.data

    const user = parsed;

    bcrypt.hash(user.password, 10, (err, hash) => {
        if (err) return res.status(500).send({status:err.message});

        createUser(user, hash, (err, user) => {
            if (err) return res.status(500).send({status:err.message});
            res.send({ "status": "OK" });
        });
    });
});

userRouter.post('/login', upload.none(), (req, res) => {

    const result = LoginSchema.safeParse(req.body)

    if (!result.success) {
        return res.status(400).json(z.treeifyError(result.error));
    }
    
    const parsed = result.data
    
    const { login, password } = parsed;
    
    getUserByLogin(login, (err, user) => {
        if (err) return res.status(500).json({ status: err.message });
        if (!user) return res.status(400).json({ status: "User not found" });
        bcrypt.compare(password, user.password, (err, match) => {
            if (err) return res.status(500).json({ status: err.message });
            if (!match) return res.status(400).json({ status: "Invalid credentials" });

            req.session.user = {
                id: user.id,
                role: user.role
            };
            res.send({ "status": "OK" });
        });
    });
});

userRouter.post('/logout', (req, res) => {
    if (!req.session.user)
        return res.status(401).send({status:"Not logged in"});

    req.session.destroy(() => {
        res.send({ "status": "OK" });
    });
});

userRouter.get('/me', (req, res) => {
    if (!req.session.user)
        return res.json({ loggedIn: false });

    getUserById(req.session.user.id, (err, user) => {
        if (err) return res.status(500).send(err.message);
        const { password: _, ...safeUser } = user
        res.json({ loggedIn: true, user: safeUser });
    });
});

userRouter.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    getUserById(id, (err, user) => {
        if (err) return res.status(500).send({status:err.message});
        const { password: _, ...safeUser } = user
        res.json(safeUser);
    }
    );
})

userRouter.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id)

    if (!req.session.user)
        return res.status(401).send({status:"Not logged in"});

    if (id != req.session.user.id) return res.status(401).send({status:"can't modify other users"});

    deleteUser(id, (err) => {
        if (err) return res.status(500).send({status:err.message});
        res.send({ "status": "OK" });
    })
})

userRouter.put('/:id', upload.none(), (req, res) => {
    const id = parseInt(req.params.id)

    if (!req.session.user)
        return res.status(401).send({status:"Not logged in"});
    if (id != req.session.user.id) return res.status(401).send({status:"can't modify other users"});

    getUserById(id, async (err, oldUser) => {
        if (err) return res.status(500).send({status:err.message});

        const result = UpdateUserSchema.safeParse(req.body)

        if (!result.success) {
            return res.status(400).json(z.treeifyError(result.error));
        }

        const parsed = result.data

        const sentUser = parsed
        const newUser = {
            ...oldUser,
            ...sentUser,
            role: oldUser.role
        };

        if (sentUser.password) {
            newUser.password = await bcrypt.hash(newUser.password, 10);
        } else {
            newUser.password = oldUser.password;
        }

        updateUser(id, newUser, (err) => {
            if (err) return res.status(500).send({status:err.message});
            const { password: _, ...safeUser } = newUser
            res.json(safeUser);
        })
    })
})

userRouter.get('/:id/comments', (req, res) => {
    const start = req.query.start ? parseInt(req.query.start) : 0;
    const count = req.query.count ? parseInt(req.query.count) : 5;
    const userid = parseInt(req.params.id)

    getCommentsByUserId(start, count, userid, (err, comments) => {
        if (err) return res.status(500).send({status:err.message});
        res.json(comments);
    })
})


module.exports = userRouter