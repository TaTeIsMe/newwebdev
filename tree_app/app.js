const express = require('express')
const cors = require('cors')
const userRouter = require('./routes/user')
const treeRouter = require('./routes/tree')
const commentRouter = require('./routes/comment')
const session = require('express-session');
const app = express()
const port = process.env.PORT || 5000
const path = require('path');

app.set('trust proxy', true);

app.use(session({
    secret: process.env.KEY || "wowwhatacoolkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 14
    }
}));

app.use(cors({
  origin: true,
  credentials: true
}));

app.use('/tree_app',express.static(path.join(__dirname, 'dist')));
app.use('/tree_app/api/trees',treeRouter)
app.use('/tree_app/api/comments',commentRouter)
app.use('/tree_app/api/users',userRouter)
app.use('/tree_app/api/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('/tree_app/*all', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})