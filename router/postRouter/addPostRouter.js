const express = require('express');
const isAuthenticate = require('../../middleware/isAuthenticate');
const router = express.Router();

const upload = require('../../middleware/multer');
const Post = require('../../model/PostModel');
const { uploadImage } = require('../../services/cloudinaryService');

router.post('/' , isAuthenticate , upload.single('image') , async (req,res) => {
    try{
        const {caption} = req.body;
        const image = req.file;
        const authorId = req.id;
        
        const imageBuffer = image.buffer;
        const imageUrl = await uploadImage(imageBuffer);
        // console.log('POST route hit');
        
        const newPost = await Post.create({
            caption,
            image: imageUrl,
            author: req.id,
        });
        
        await newPost.save();

        const populatedPost = await Post.findById(newPost._id)
        .populate({
            path: 'author',
            select: '_id userName profilePicture'
        });

        return res.status(200).json({
            message : "Post Successfully",
            success : true,
            post : populatedPost
        });

    }catch(err){
        return res.status(500).json({
            message : err.message,
            success : false
        });
    }
})

module.exports = router;