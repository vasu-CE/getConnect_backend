const express = require('express');
const { app , server} = require('./socket/socket');
const cors =  require('cors');
// var app = express();
const dotenv = require('dotenv');
dotenv.config({});

// CORS middleware
app.use(cors({
    origin: process.env.CLINT_URL || "http://localhost:5173",
    credentials: true
}));

const path = require('path');
const cookieParser = require('cookie-parser');
// const userModel = require('./model/userModel');
const authRouter = require('./router/userRouter/authRouter');
const profileRouter = require('./router/userRouter/controlle');
const renderRouter = require('./router/userRouter/rendering');
const profile2Router = require('./router/userRouter/profile2Router');
const likeAndDislike = require('./router/postRouter/likeAndDislike');
const deletePost = require('./router/postRouter/deletePostRouter');

const addPost = require('./router/postRouter/addPostRouter');
const getAllPost = require('./router/postRouter/getAllPostRouter');
const myPost = require('./router/postRouter/getMyPostRouter');

const message = require('./router/userRouter/message');
const search = require('./router/userRouter/search');
const quiz = require('./router/userRouter/quiz');

const projectRoutes = require('./router/projectRouter/project.routes')
const aiRoutes = require('./router/projectRouter/ai.routes')

const session = require('express-session')
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname,'/public')));
app.set("view engine" , 'ejs');
app.set('views',path.join(__dirname,"/views"))

app.use(session({
    secret: 'qwerhjj',
    resave: false,
    saveUninitialized: true
}));

app.use('/user',authRouter);
app.use('/profile' , profileRouter);
app.use('/view' , profile2Router);
app.use('/render' , renderRouter);
app.use('/post/addPost' , addPost);
app.use('/post/allpost' , getAllPost);
app.use('/userpost/all' , myPost);
app.use('/post' , likeAndDislike)
app.use('/post' , deletePost)
app.use('/messages' , message);
app.use('/search' , search);
app.use('/quiz',quiz);
app.use('/projects',projectRoutes);
app.use('/ai',aiRoutes);

const port = process.env.PORT || 3000;
server.listen(port , () => {
    console.log(`http://localhost:${port}`);
})