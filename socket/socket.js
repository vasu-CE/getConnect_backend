const http = require('http');
const {Server} = require('socket.io');
require('dotenv').config();

const express = require('express');
const app = express();

const mongoose = require('mongoose');
const projectModel = require('../model/projectModel');
const userModel = require("../model/userModel");
const {generateResult} = require('../services/ai.service');
const messageModel = require('../model/messageModel');

const server = http.createServer(app);

// Set the port for the server
const port = process.env.PORT || 3002;
server.listen(port, () => {
    console.log(`Socket server running on port ${port}`);
});

const io = new Server(server, {
    cors: {
        origin : process.env.CLINT_URL || 'http://localhost:5173'
    }
});
const projectIo = io.of('/project-chat');

//this is for Project-Chat
projectIo.use(async (socket , next) => {
    try{
        const projectId = socket.handshake.auth.projectId;
        
        if(!mongoose.Types.ObjectId.isValid(projectId)){
            return next(new Error('Invalid projectId'));
        }
        socket.project = await projectModel.findById(projectId);
        
        next();
    }catch(err){
        next(err);
    }
})

projectIo.on('connection',socket => {
    // console.log("A user connected");.
    
    socket.roomId = socket.project._id.toString();
    socket.join(socket.roomId);
    // console.log(`User joined project chat room: ${socket.roomId}`);
    
    socket.on('project-message', async (data) => {
        const message = data.message;
        const aiIsPresent = message.includes('@ai');
        
        // Broadcast message to other users in the room
        socket.broadcast.to(socket.roomId).emit('project-message', data);

        if (aiIsPresent) {
            try {
                const prompt = message.replace('@ai', '').trim();
                const result = await generateResult(prompt);
                // console.log(result)
                projectIo.to(socket.roomId).emit('project-message', {
                    message: result,
                    sender: {
                        _id: 'ai',
                        userName: 'AI'
                    }
                });
            } catch (err) {
                console.error('Error generating AI response:', err);
            }
        }
    });
    
    socket.on('disconnect', () => {
        // console.log(`User disconnected from project room: ${socket.roomId}`);
        socket.leave(socket.roomId);
    });
    
});

const userChatIo = io.of('/user-chat');

userChatIo.use(async (socket , next) => {
    try{
        const userId = socket.handshake.auth.userId;
        
        if(!mongoose.Types.ObjectId.isValid(userId)){
            return next(new Error("User id invalid"));
        }
        socket.user = await userModel.findById(userId);
        next();
    }catch(err){
        next(err);
    }
})

const onlineUsers = new Set();
userChatIo.on('connection' , socket => {
    // console.log("A user is connected to user chat" , socket.user?._id.toString());

    socket.userId = socket?.user?._id.toString();

    socket.join(socket.userId);

    onlineUsers.add(socket.userId);
    userChatIo.emit('onlineUsers', Array.from(onlineUsers));

    socket.on('user-message' , async (data) => {
        const {recipientId , message} = data;

        if (!mongoose.Types.ObjectId.isValid(recipientId)) {
            return socket.emit('error', { message: 'Invalid recipient ID' });
        }
        // console.log(`Received message from ${socket.userId} to ${recipientId}: ${message}`);
        userChatIo.to(recipientId).emit('user-message' , {
            message,
            sender : {
                _id : socket.userId,
                userName : socket.user.userName
            },
            timestamp: Date.now()
        });

            // console.log(`Message sent to user ${recipientId}: ${message}`);
    })

    socket.on('typing' , ({recipientId}) => {
        // console.log(socket.userId)
        userChatIo.to(recipientId).emit('typing' , {senderId : socket.userId})
    })

    socket.on('stopTyping', ({ recipientId }) => {
        userChatIo.to(recipientId).emit('stopTyping', { senderId: socket.userId });
    });

    

    socket.on('messageDelivered', async (messageId) => {
        await messageModel.findByIdAndUpdate(messageId , { status : 'delivered' });
    })

    socket.on('messageRead', async (messageId) => {
        await messageModel.findByIdAndUpdate(messageId , { status : 'read' });
    });

    socket.on('disconnect', () => {
        // console.log(`User disconnected: ${socket.userId}`);
        socket.leave(socket.userId);
        onlineUsers.delete(socket.userId);
        userChatIo.emit('onlineUsers', Array.from(onlineUsers));
    });
})
module.exports = { app, server, io , userChatIo};