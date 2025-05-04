const mongoose = require('mongoose');

// Schema for Message (One-on-One Message)
const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    message: {
        type: String,
        required: true
    },
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    }
}, {timestamps : true});

messageSchema.index({ conversationId: 1, senderId: 1 });
messageSchema.index({ conversationId: 1, receiverId: 1 });

module.exports = mongoose.model('Message', messageSchema);
