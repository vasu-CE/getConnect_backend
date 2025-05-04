const mongoose = require('mongoose');

// Schema for Conversation (One-on-One)
const conversationSchema = mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    unreadCount: {
        type: Map,
        of: Number,
        default: {}
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
},{ timestamps: true });

conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessage: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
