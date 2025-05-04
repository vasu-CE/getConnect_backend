const express = require('express');
const isAuthenticate = require('../../middleware/isAuthenticate');
const router = express.Router();

const upload = require('../../middleware/multer');
const Post = require('../../model/PostModel');

router.get('/' , isAuthenticate , async (req,res) => {
    try{
        const authorId = req.id;
        const posts = await Post.findById({author : authorId}).sort({createdAt : -1}) 
        .populate({
            path : 'author',
            select : 'userName profilePicture'
        });

        return render('profile' , {posts})
    } catch(err){
        res.send(err.message);
    }
})

module.exports = router;
