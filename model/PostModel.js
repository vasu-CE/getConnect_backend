const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const postSchema = mongoose.Schema({
    caption : {
        type : String,
        default : ""
    },
    image : {
        type : String,
        default : ""
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comments: [commentSchema], 
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
}, { timestamps: true });

module.exports = mongoose.model("Post" , postSchema);