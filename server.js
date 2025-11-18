const express = require('express');
const { app, server } = require('./socket/socket');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// CORS middleware
app.use(cors({
    origin: process.env.CLINT_URL || "http://localhost:5173",
    credentials: true
}));

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
    secret: 'qwerhjj',
    resave: false,
    saveUninitialized: true
}));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/quiz', require('./routes/quizRoutes'));

// 404 handler for undefined routes
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler middleware (must be last)
app.use(errorHandler);

// Server is started in socket.js
console.log('API server configured and ready');