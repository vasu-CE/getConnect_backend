const express = require('express');
const isAuthenticate = require('../../middleware/isAuthenticate');
const router = express.Router();

const upload = require('../../middleware/multer');
const Post = require('../../model/PostModel');
const PostModel = require('../../model/PostModel');

router.get('/:id/like', isAuthenticate, async (req, res) => {
    try {
        const userId = req.id;
        const postId = req.params.id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                success: false
            });
        }

        if (post.likes.includes(userId)) {
            return res.status(400).json({
                message: "Post already liked",
                success: false,
                likeCount: post.likes.length
            });
        }

        post.likes.push(userId);
        await post.save();

        return res.status(200).json({
            message: "Post liked successfully",
            success: true,
            likeCount: post.likes.length
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message,
            success: false
        });
    }
});

router.get('/:id/dislike', isAuthenticate, async (req, res) => {
    try {
        const userId = req.id;
        const postId = req.params.id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                success: false
            });
        }

        // Check if post is not already disliked
        if (!post.likes.includes(userId)) {
            return res.status(400).json({
                message: "Post not liked yet",
                success: false,
                likeCount: post.likes.length
            });
        }

        // Remove like
        post.likes = post.likes.filter(id => id.toString() !== userId.toString());
        await post.save();

        return res.status(200).json({
            message: "Post disliked successfully",
            success: true,
            likeCount: post.likes.length
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message,
            success: false
        });
    }
});

router.post('/:id/comment' , isAuthenticate , async (req,res) => {
    try{
        const {message} = req.body;
        const postId = req.params.id;
        const authorId = req.id;
        
        const post = await PostModel.findById(postId);
        if(!post){
            return res.status(404).json({
                message : err.message || 'Post not found',
                success : false
            })
        }

        const newComment = {
            user: authorId,
            text: message,
            createdAt: new Date()
        };
      
        post.comments.push(newComment);
        await post.save();

        const updatedPost = await PostModel.findById(postId)
        .populate("comments.user", "userName profilePicture") // Populate only `name` and `profilePic`
        .exec();

        res.status(201).json({
            message: "Comment added", 
            comments: updatedPost.comments,
            success : true 
        });

    }catch(err){
        res.status(404).json({
            message : err.message || 'Server Error',
            success : false
        })
    }
})

router.get(':/id/comments' , isAuthenticate , async (req,res) => {
    try{
        const postId = req.params.id;

        const post = await PostModel.findById(postId).populate("comments.user" , "userName")
        if (!post) return res.status(404).json({ message: "Post not found" , success : false });

        res.json(post.comments);
    }catch(err){
        res.status(500).json({
            err : err.message
        });
    }
})

router.get(':id/comments/:commentid' , isAuthenticate , async (req , res) => {
    try{
        const {postId , commentId} = req.params;
        const authorId = req.id;

        const post = PostModel.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" , success : false });

        const commentIndex = post.comments.findIndex(
            (comment) => comment._id.toString() === commentId && comment.user.toString() === authorId
        );


        if (commentIndex === -1) return res.status(403).json({ message: "Unauthorized to delete this comment" });

        post.comments.splice(commentIndex, 1);
        await post.save();

        res.json({ message: "Comment deleted", comments: post.comments });
    }catch(err){
        res.status(500).json({ err : err.message });
    }
})

module.exports = router;