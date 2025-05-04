const express = require('express');
const isAuthenticate = require('../../middleware/isAuthenticate');
const router = express.Router();

const Post = require('../../model/PostModel');
const userModel = require('../../model/userModel');


router.get('/delete/:id' , isAuthenticate , async (req,res) => {
    try{
        const userId = req.id;
        const postId = req.params.id;
        
            
        const post =await Post.findById(postId);
        if(!post) return res.status(401).json({
            message : "Post not found",
            success : false
        })
        
        if(post.author.toString() != userId){
            return res.send("You can't delete this post");
        }

        await Post.findByIdAndDelete(postId);

        let user = await userModel.findById(userId);
        user.posts = user.posts.filter(id => id.toString() != postId);
        await user.save();
        await redisClient.del('posts');
        // res.redirect('/post/allpost');
        return res.status(200).json({
            message : "Post deleted successfully",
            success : true
        })

    } catch(err){
        return res.status(500).json({
            message : "Internal server error",
            success : false
        })
    }
})

module.exports = router;
