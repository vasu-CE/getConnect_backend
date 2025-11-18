const express = require('express');
const router = express.Router();
const isAuthenticate = require('../middleware/isAuthenticate');
const conversationModel = require('../model/conversationModel');
const messageModel = require('../model/messageModel');
const { getReciverSocketId, io } = require('../socket/socket');
const { default: mongoose } = require('mongoose');

// Send a message
router.post('/send/:id', isAuthenticate, async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const { textMessage: message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message text is required'
            });
        }

        let conversation = await conversationModel.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        if (!conversation) {
            conversation = await conversationModel.create({
                participants: [senderId, receiverId],
                messages: [],
            });
        }

        const newMessage = await messageModel.create({
            senderId,
            receiverId,
            message,
            conversationId: conversation._id,
        });

        if (newMessage) {
            await conversationModel.findByIdAndUpdate(
                conversation._id,
                {
                    $push: { messages: newMessage._id },
                    $set: { lastMessage: newMessage._id },
                },
                { new: true }
            );
        }

        io.to(receiverId).emit("receiveMessage", newMessage);

        return res.status(201).json({
            success: true,
            newMessage,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "An error occurred while sending the message.",
        });
    }
});

// Get conversation messages
router.get('/conversation/:id', isAuthenticate, async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;

        if (!mongoose.isValidObjectId(senderId) || !mongoose.isValidObjectId(receiverId)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid user ID format' 
            });
        }

        const conversation = await conversationModel
            .findOne({ participants: { $all: [senderId, receiverId] } })
            .select('_id')
            .lean();

        if (!conversation) {
            return res.status(200).json({ 
                success: true, 
                messages: [],
                hasMore: false 
            });
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;

        const messages = await messageModel
            .find({ conversationId: conversation._id })
            .select('_id message senderId receiverId createdAt')
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const hasMore = (page * limit) < (await messageModel.countDocuments({ conversationId: conversation._id }));

        res.status(200).json({ 
            success: true, 
            messages, 
            hasMore 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
});

// Get all conversations for a user
router.get('/conversations', isAuthenticate, async (req, res) => {
    try {
        const userId = req.id;

        const conversations = await conversationModel
            .find({ participants: { $in: [userId] } })
            .populate('participants', 'userName profilePicture')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            conversations
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

module.exports = router;
